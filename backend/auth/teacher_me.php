<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../teacher-management/helpers.php';
require_once __DIR__ . '/teacher_middleware.php';

require_teacher($pdo);

$stmt = $pdo->prepare('SELECT * FROM teachers WHERE id = ? LIMIT 1');
$stmt->execute([$current_teacher_id]);
$teacherRow = $stmt->fetch();

if (!$teacherRow) {
    json_response(['success' => false, 'message' => 'Teacher not found.'], 404);
}

// Fetch students for this teacher
$studentStmt = $pdo->prepare('SELECT * FROM teacher_students WHERE teacher_id = ? ORDER BY student_name ASC, id ASC');
$studentStmt->execute([(int) $teacherRow['id']]);
$students = array_map('map_teacher_student', $studentStmt->fetchAll());

json_response([
    'success' => true,
    'teacher' => map_teacher($teacherRow, $students),
]);
