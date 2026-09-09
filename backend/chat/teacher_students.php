<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/class_helpers.php';

$actor = chat_actor($pdo);
if ($actor['role'] !== 'teacher' && $actor['role'] !== 'admin') {
    json_response(['success' => false, 'message' => 'Access restricted to teachers and admin.'], 403);
}

$teacherId = (int)($_GET['teacher_id'] ?? 0);
if ($teacherId <= 0 && $actor['role'] === 'teacher') {
    $teacherId = (int)$actor['id'];
}
if ($teacherId <= 0) {
    json_response(['success' => false, 'message' => 'Invalid teacher ID.'], 422);
}

$stmt = $pdo->prepare("
    SELECT id, student_name, email, course_name AS course, status 
    FROM teacher_students 
    WHERE teacher_id = ? 
    ORDER BY student_name ASC
");
$stmt->execute([$teacherId]);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response([
    'success' => true,
    'teacher_id' => $teacherId,
    'students' => array_map(function($s) {
        return [
            'id' => (int)$s['id'],
            'student_name' => $s['student_name'],
            'email' => $s['email'] ?? '',
            'course' => $s['course'] ?? '',
            'status' => $s['status'] ?? 'Active'
        ];
    }, $students)
]);
