<?php
require_once __DIR__ . '/zoom_helpers.php';

zoom_ensure_schema($pdo);
$actor = chat_actor($pdo);

if ($actor['role'] !== 'admin') {
    json_response(['success' => false, 'message' => 'Admin access required to update meeting status.'], 403);
}

$data = read_json_body();
$id = (int)($data['id'] ?? 0);
$status = trim($data['status'] ?? '');
$cancelReason = trim($data['cancel_reason'] ?? '');

$allowedStatuses = ['scheduled', 'live', 'completed', 'cancelled'];
if (!in_array($status, $allowedStatuses, true)) {
    json_response(['success' => false, 'message' => 'Invalid status option.'], 422);
}

$mStmt = $pdo->prepare("SELECT id, teacher_id, title FROM zoom_meetings WHERE id = ?");
$mStmt->execute([$id]);
$meeting = $mStmt->fetch(PDO::FETCH_ASSOC);

if (!$meeting) {
    json_response(['success' => false, 'message' => 'Meeting not found.'], 404);
}

$update = $pdo->prepare("
    UPDATE zoom_meetings 
    SET status = ?, cancel_reason = ? 
    WHERE id = ?
");
$update->execute([$status, ($status === 'cancelled' ? $cancelReason : null), $id]);

// Fetch enrolled student IDs for websocket broadcast
$sStmt = $pdo->prepare("SELECT student_id FROM zoom_meeting_students WHERE meeting_id = ?");
$sStmt->execute([$id]);
$studentIds = array_map('intval', $sStmt->fetchAll(PDO::FETCH_COLUMN));

zoom_broadcast_ws([
    'event' => 'zoom_meeting_status_changed',
    'meeting_id' => $id,
    'teacher_id' => (int)$meeting['teacher_id'],
    'status' => $status,
    'cancel_reason' => $cancelReason,
    'title' => $meeting['title'],
    'student_ids' => $studentIds
]);

json_response([
    'success' => true,
    'message' => "Meeting status changed to " . ucfirst($status) . ".",
    'status' => $status
]);
