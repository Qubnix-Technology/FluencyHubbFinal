<?php
require_once __DIR__ . '/zoom_helpers.php';

zoom_ensure_schema($pdo);
$actor = chat_actor($pdo);

if ($actor['role'] !== 'admin') {
    json_response(['success' => false, 'message' => 'Admin access required to create or edit meetings.'], 403);
}

$data = read_json_body();

$id = !empty($data['id']) ? (int)$data['id'] : 0;
$title = trim($data['title'] ?? '');
$meetingLink = trim($data['meeting_link'] ?? '');
$meetingId = trim($data['meeting_id'] ?? '');
$passcode = trim($data['passcode'] ?? '');
$teacherId = (int)($data['teacher_id'] ?? 0);
$scheduledDate = trim($data['scheduled_date'] ?? '');
$scheduledTime = trim($data['scheduled_time'] ?? '');
$durationMinutes = !empty($data['duration_minutes']) ? (int)$data['duration_minutes'] : 60;
$status = in_array($data['status'] ?? '', ['scheduled', 'live', 'completed', 'cancelled'], true) ? $data['status'] : 'scheduled';
$notes = trim($data['notes'] ?? '');
$studentIds = is_array($data['student_ids'] ?? null) ? array_map('intval', $data['student_ids']) : [];

if ($title === '') {
    json_response(['success' => false, 'message' => 'Meeting title / topic is required.'], 422);
}

if ($meetingLink === '' || !filter_var($meetingLink, FILTER_VALIDATE_URL)) {
    json_response(['success' => false, 'message' => 'A valid Zoom meeting link URL is required.'], 422);
}

if ($teacherId <= 0) {
    json_response(['success' => false, 'message' => 'Please select a teacher for this class.'], 422);
}

if ($scheduledDate === '' || $scheduledTime === '') {
    json_response(['success' => false, 'message' => 'Please select meeting date and time.'], 422);
}

// Verify teacher exists
$tCheck = $pdo->prepare("SELECT id, name FROM teachers WHERE id = ?");
$tCheck->execute([$teacherId]);
$teacher = $tCheck->fetch(PDO::FETCH_ASSOC);
if (!$teacher) {
    json_response(['success' => false, 'message' => 'Selected teacher does not exist.'], 404);
}

// If studentIds is empty and 'select_all' was requested or teacher has students, optionally fetch all
if (empty($studentIds) && !empty($data['all_students'])) {
    $sQuery = $pdo->prepare("SELECT id FROM teacher_students WHERE teacher_id = ?");
    $sQuery->execute([$teacherId]);
    $studentIds = array_map('intval', $sQuery->fetchAll(PDO::FETCH_COLUMN));
}

if ($id > 0) {
    // Update existing meeting
    $stmt = $pdo->prepare("
        UPDATE zoom_meetings SET 
            title = ?,
            meeting_link = ?,
            meeting_id = ?,
            passcode = ?,
            teacher_id = ?,
            scheduled_date = ?,
            scheduled_time = ?,
            duration_minutes = ?,
            status = ?,
            notes = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $title,
        $meetingLink,
        $meetingId,
        $passcode,
        $teacherId,
        $scheduledDate,
        $scheduledTime,
        $durationMinutes,
        $status,
        $notes,
        $id
    ]);
    $meetingDbId = $id;
} else {
    // Insert new meeting
    $stmt = $pdo->prepare("
        INSERT INTO zoom_meetings (
            title, meeting_link, meeting_id, passcode, teacher_id, 
            scheduled_date, scheduled_time, duration_minutes, status, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $title,
        $meetingLink,
        $meetingId,
        $passcode,
        $teacherId,
        $scheduledDate,
        $scheduledTime,
        $durationMinutes,
        $status,
        $notes,
        (int)$actor['id']
    ]);
    $meetingDbId = (int)$pdo->lastInsertId();
}

// Update students list for this meeting
$pdo->prepare("DELETE FROM zoom_meeting_students WHERE meeting_id = ?")->execute([$meetingDbId]);
if (!empty($studentIds)) {
    $insertStudent = $pdo->prepare("
        INSERT IGNORE INTO zoom_meeting_students (meeting_id, student_id) 
        VALUES (?, ?)
    ");
    foreach ($studentIds as $sId) {
        if ($sId > 0) {
            $insertStudent->execute([$meetingDbId, $sId]);
        }
    }
}

// Broadcast WebSocket event
zoom_broadcast_ws([
    'event' => ($id > 0 ? 'zoom_meeting_updated' : 'zoom_meeting_created'),
    'meeting_id' => $meetingDbId,
    'teacher_id' => $teacherId,
    'status' => $status,
    'title' => $title,
    'scheduled_date' => $scheduledDate,
    'scheduled_time' => $scheduledTime,
    'student_ids' => $studentIds
]);

json_response([
    'success' => true,
    'message' => $id > 0 ? 'Live meeting updated successfully!' : 'Live meeting scheduled and sent to teacher & students!',
    'meeting_id' => $meetingDbId
]);
