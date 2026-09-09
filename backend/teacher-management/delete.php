<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

require_admin($pdo);

$data = read_json_body();
$type = $data['type'] ?? '';
$id = (int) ($data['id'] ?? 0);

if (!in_array($type, ['teacher', 'student'], true) || $id <= 0) {
    json_response(['success' => false, 'message' => 'Valid delete type and id are required.'], 422);
}

if ($type === 'teacher') {
    $stmt = $pdo->prepare('DELETE FROM teachers WHERE id = ?');
    $stmt->execute([$id]);
    json_response(['success' => true, 'message' => 'Teacher deleted.']);
}

$stmt = $pdo->prepare('DELETE FROM teacher_students WHERE id = ?');
$stmt->execute([$id]);
json_response(['success' => true, 'message' => 'Student assignment deleted.']);
