<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/class_helpers.php';

$actor = chat_actor($pdo);
$data = json_decode(file_get_contents('php://input'), true) ?? [];
$teacherId = isset($data['teacher_id']) ? (int)$data['teacher_id'] : -1;
$messageId = isset($data['message_id']) ? (int)$data['message_id'] : 0;

if ($teacherId < 0) {
    json_response(['success' => false, 'message' => 'teacher_id is required.'], 422);
}

class_chat_mark_read($pdo, $actor, $teacherId, $messageId);

json_response([
    'success' => true,
    'message' => 'Marked as read.'
]);
