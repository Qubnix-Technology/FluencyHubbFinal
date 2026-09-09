<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';
require_once __DIR__ . '/helpers.php';

require_admin($pdo);

$teacherRows = $pdo->query('SELECT * FROM teachers ORDER BY name ASC, id ASC')->fetchAll();
$studentStmt = $pdo->prepare('SELECT * FROM teacher_students WHERE teacher_id = ? ORDER BY student_name ASC, id ASC');

$teachers = [];
foreach ($teacherRows as $teacherRow) {
    $studentStmt->execute([(int) $teacherRow['id']]);
    $students = array_map('map_teacher_student', $studentStmt->fetchAll());
    $teachers[] = map_teacher($teacherRow, $students);
}

json_response(['success' => true, 'teachers' => $teachers]);
