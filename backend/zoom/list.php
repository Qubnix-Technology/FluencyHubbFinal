<?php
require_once __DIR__ . '/zoom_helpers.php';

zoom_ensure_schema($pdo);
$actor = chat_actor($pdo);

// Auto-transition scheduled meetings to 'live' when their scheduled time has arrived (in Asia/Kolkata)
// Also auto-transition 'live' meetings to 'completed' once their scheduled time + duration has passed.
try {
    $now = date('Y-m-d H:i:s');
    // 1. Move scheduled -> live when scheduled datetime <= now AND scheduled datetime + duration > now
    $stmtLive = $pdo->prepare("
        UPDATE zoom_meetings 
        SET status = 'live' 
        WHERE status = 'scheduled' 
          AND TIMESTAMP(scheduled_date, scheduled_time) <= ?
          AND TIMESTAMPADD(MINUTE, duration_minutes, TIMESTAMP(scheduled_date, scheduled_time)) > ?
    ");
    $stmtLive->execute([$now, $now]);
    if ($stmtLive->rowCount() > 0) {
        zoom_broadcast_ws(['event' => 'zoom_meeting_status_changed', 'action' => 'auto_live']);
    }

    // 2. Move live -> completed when now >= scheduled datetime + duration
    $stmtComplete = $pdo->prepare("
        UPDATE zoom_meetings 
        SET status = 'completed' 
        WHERE status = 'live' 
          AND TIMESTAMPADD(MINUTE, duration_minutes, TIMESTAMP(scheduled_date, scheduled_time)) <= ?
    ");
    $stmtComplete->execute([$now]);
    if ($stmtComplete->rowCount() > 0) {
        zoom_broadcast_ws(['event' => 'zoom_meeting_status_changed', 'action' => 'auto_completed']);
    }
} catch (Throwable $e) {}

$meetings = [];

if ($actor['role'] === 'admin') {
    // Admin sees all meetings
    $sql = "
        SELECT zm.*, t.name AS teacher_name, t.email AS teacher_email, t.photo AS teacher_photo
        FROM zoom_meetings zm
        JOIN teachers t ON t.id = zm.teacher_id
        ORDER BY zm.scheduled_date DESC, zm.scheduled_time DESC, zm.id DESC
    ";
    $stmt = $pdo->query($sql);
    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);
} elseif ($actor['role'] === 'teacher') {
    // Teacher sees their assigned meetings
    $sql = "
        SELECT zm.*, t.name AS teacher_name, t.email AS teacher_email, t.photo AS teacher_photo
        FROM zoom_meetings zm
        JOIN teachers t ON t.id = zm.teacher_id
        WHERE zm.teacher_id = ?
        ORDER BY zm.scheduled_date DESC, zm.scheduled_time DESC, zm.id DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([(int)$actor['id']]);
    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);
} elseif ($actor['role'] === 'student') {
    // Student sees meetings where they are enrolled
    $sql = "
        SELECT zm.*, t.name AS teacher_name, t.email AS teacher_email, t.photo AS teacher_photo
        FROM zoom_meetings zm
        JOIN teachers t ON t.id = zm.teacher_id
        JOIN zoom_meeting_students zms ON zms.meeting_id = zm.id
        WHERE zms.student_id = ?
        ORDER BY zm.scheduled_date DESC, zm.scheduled_time DESC, zm.id DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([(int)$actor['id']]);
    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fetch assigned students for each meeting
$meetingIds = array_column($meetings, 'id');
$studentsByMeeting = [];

if (!empty($meetingIds)) {
    $inPlaceholders = implode(',', array_fill(0, count($meetingIds), '?'));
    $sStmt = $pdo->prepare("
        SELECT zms.meeting_id, ts.id, ts.student_name, ts.email, ts.course_name AS course
        FROM zoom_meeting_students zms
        JOIN teacher_students ts ON ts.id = zms.student_id
        WHERE zms.meeting_id IN ($inPlaceholders)
        ORDER BY ts.student_name ASC
    ");
    $sStmt->execute($meetingIds);
    while ($row = $sStmt->fetch(PDO::FETCH_ASSOC)) {
        $mId = (int)$row['meeting_id'];
        if (!isset($studentsByMeeting[$mId])) {
            $studentsByMeeting[$mId] = [];
        }
        $studentsByMeeting[$mId][] = [
            'id' => (int)$row['id'],
            'student_name' => $row['student_name'],
            'email' => $row['email'] ?? '',
            'course' => $row['course'] ?? ''
        ];
    }
}

foreach ($meetings as &$m) {
    $m['id'] = (int)$m['id'];
    $m['teacher_id'] = (int)$m['teacher_id'];
    $m['duration_minutes'] = (int)$m['duration_minutes'];
    $m['students'] = $studentsByMeeting[$m['id']] ?? [];
    $m['student_count'] = count($m['students']);
}

json_response([
    'success' => true,
    'role' => $actor['role'],
    'server_time' => date('Y-m-d H:i:s'),
    'timezone' => 'Asia/Kolkata',
    'meetings' => $meetings
]);
