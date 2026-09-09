<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/teacher_middleware.php';
require_once __DIR__ . '/../teacher-management/helpers.php';

require_teacher($pdo);
$data = json_decode(file_get_contents('php://input'), true);

$student_id = $data['student_id'] ?? null;
$completedClasses = (int) ($data['completedClasses'] ?? 0);
$remainingClasses = (int) ($data['remainingClasses'] ?? 0);
$thisWeekClasses = (int) ($data['thisWeekClasses'] ?? 0);

if (!$student_id) {
    json_response(['success' => false, 'message' => 'Student ID is required'], 400);
}

// Verify student belongs to this teacher
$stmt = $pdo->prepare('SELECT id FROM teacher_students WHERE id = ? AND teacher_id = ?');
$stmt->execute([$student_id, $current_teacher_id]);
if (!$stmt->fetch()) {
    json_response(['success' => false, 'message' => 'Student not found or access denied'], 403);
}

$completed_before_week = $completedClasses - $thisWeekClasses;

$stmt = $pdo->prepare('UPDATE teacher_students SET completed_before_week = ?, this_week_classes = ? WHERE id = ?');
$stmt->execute([$completed_before_week, $thisWeekClasses, $student_id]);

// Fetch updated teacher data
$stmt = $pdo->prepare('SELECT * FROM teachers WHERE id = ?');
$stmt->execute([$current_teacher_id]);
$updated_teacher = $stmt->fetch();

$stmt = $pdo->prepare('SELECT * FROM teacher_students WHERE teacher_id = ? ORDER BY student_name ASC, id ASC');
$stmt->execute([(int) $current_teacher_id]);
$students = array_map('map_teacher_student', $stmt->fetchAll());

json_response(['success' => true, 'teacher' => map_teacher($updated_teacher, $students)]);
