<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/class_helpers.php';

$actor = chat_actor($pdo);
class_chat_ensure_schema($pdo);

$data = read_json_body();
$id = (int)($data['id'] ?? 0);

if ($id < 1) {
    json_response(['success' => false, 'message' => 'Invalid message ID.'], 422);
}

$q = $pdo->prepare('SELECT id, teacher_id, sender_role, sender_id, content, created_at, recipient_student_id, broadcast_id FROM class_messages WHERE id=? AND deleted_at IS NULL');
$q->execute([$id]);
$message = $q->fetch(PDO::FETCH_ASSOC);

if (!$message) {
    json_response(['success' => false, 'message' => 'Message not found or already deleted.'], 404);
}

class_chat_allowed($pdo, $actor, (int)$message['teacher_id']);

// Direct teacher/student conversations are private and are not manageable
// through the admin class-discussion panel.
if (!empty($message['recipient_student_id'])) {
    json_response(['success' => false, 'message' => 'Direct messages are private and cannot be deleted here.'], 403);
}

// Permission rule:
// ONLY Admin can delete messages. Teachers and Students are not allowed to delete messages.
if ($actor['role'] !== 'admin') {
    json_response(['success' => false, 'message' => 'Only Admin is allowed to delete messages.'], 403);
}

// Soft delete the primary message
$upd = $pdo->prepare('UPDATE class_messages SET deleted_at=NOW() WHERE id=?');
$upd->execute([$id]);

// If it's a broadcast message or admin message, soft-delete all broadcast copies across all teachers
if (!empty($message['broadcast_id'])) {
    $bc = $pdo->prepare('UPDATE class_messages SET deleted_at=NOW() WHERE broadcast_id=? AND deleted_at IS NULL');
    $bc->execute([$message['broadcast_id']]);
} elseif ($message['sender_role'] === 'admin') {
    $bc = $pdo->prepare('UPDATE class_messages SET deleted_at=NOW() WHERE sender_role="admin" AND sender_id=? AND content=? AND created_at=? AND deleted_at IS NULL');
    $bc->execute([(int)$message['sender_id'], $message['content'], $message['created_at']]);
}

class_chat_broadcast_ws([
    'event' => 'delete_message',
    'id' => $id,
    'broadcast_id' => $message['broadcast_id'] ?? null
]);

json_response(['success' => true, 'id' => $id]);
