<?php
require_once __DIR__ . '/zoom_helpers.php';

zoom_ensure_schema($pdo);
$actor = chat_actor($pdo);

if ($actor['role'] !== 'admin') {
    json_response(['success' => false, 'message' => 'Admin access required to delete meetings.'], 403);
}

$data = read_json_body();
$id = (int)($data['id'] ?? 0);

if ($id <= 0) {
    json_response(['success' => false, 'message' => 'Invalid meeting ID.'], 422);
}

$stmt = $pdo->prepare("DELETE FROM zoom_meetings WHERE id = ?");
$stmt->execute([$id]);

zoom_broadcast_ws([
    'event' => 'zoom_meeting_deleted',
    'meeting_id' => $id
]);

json_response([
    'success' => true,
    'message' => 'Meeting deleted successfully.'
]);
