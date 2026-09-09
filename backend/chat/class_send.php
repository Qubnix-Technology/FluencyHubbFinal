<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/class_helpers.php';

$actor = chat_actor($pdo);
$data = read_json_body();
$teacherId = (int)($data['teacher_id'] ?? 0);
$content = trim($data['content'] ?? '');
$isBroadcast = ($actor['role'] === 'admin' && ($teacherId === 0 || !empty($data['broadcast'])));

class_chat_allowed($pdo, $actor, $teacherId);

if ($content === '' || mb_strlen($content) > 2000) {
    json_response(['success' => false, 'message' => 'Message must be between 1 and 2000 characters.'], 422);
}

$senderName = ($actor['role'] === 'admin') ? 'Admin' : $actor['name'];
$now = date('Y-m-d H:i:s');

$recipientStudentId = !empty($data['recipient_student_id']) ? (int)$data['recipient_student_id'] : null;
// A recipient always means direct delivery. This fail-closed default prevents
// an individual message from being downgraded to a class message if a client
// omits the optional is_direct flag.
$isDirect = !empty($data['is_direct']) || $recipientStudentId !== null;

if ($isBroadcast) {
    // Broadcast announcement to all active teacher classes
    $teacherStmt = $pdo->query("SELECT id FROM teachers WHERE status != 'Inactive' OR status IS NULL");
    $teachers = $teacherStmt->fetchAll(PDO::FETCH_COLUMN);
    if (empty($teachers)) {
        $teacherStmt = $pdo->query("SELECT id FROM teachers");
        $teachers = $teacherStmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    $broadcastId = 'bc_' . bin2hex(random_bytes(16));
    $insert = $pdo->prepare("
        INSERT INTO class_messages 
            (teacher_id, sender_role, sender_id, content, is_broadcast, broadcast_id, recipient_student_id, created_at) 
        VALUES 
            (?, 'admin', ?, ?, 1, ?, NULL, ?)
    ");
    
    $lastId = 0;
    foreach ($teachers as $tid) {
        $insert->execute([(int)$tid, (int)$actor['id'], $content, $broadcastId, $now]);
        if (!$lastId) {
            $lastId = (int)$pdo->lastInsertId();
        }
    }
    
    $messagePayload = [
        'id' => $lastId ?: time(),
        'teacher_id' => 0,
        'sender_role' => 'admin',
        'sender_id' => (int)$actor['id'],
        'sender_name' => 'Admin',
        'content' => $content,
        'is_broadcast' => true,
        'broadcast_id' => $broadcastId,
        'recipient_student_id' => null,
        'created_at' => $now
    ];

    class_chat_broadcast_ws([
        'event' => 'new_message',
        'teacher_id' => 0,
        'is_broadcast' => true,
        'message' => $messagePayload
    ]);

    json_response([
        'success' => true,
        'broadcast' => true,
        'message' => $messagePayload
    ]);
} else {
    if ($teacherId < 1) {
        json_response(['success' => false, 'message' => 'Please select a teacher to send a message.'], 422);
    }

    /*
     * Direct-message authorization is deliberately enforced here, rather than
     * trusting the UI.  A teacher may address only a student assigned to that
     * teacher.  Students may create a direct reply only in their own thread.
     * Admin announcements remain class messages and can never become a direct
     * thread through a crafted request.
     */
    if ($actor['role'] === 'teacher' && $isDirect) {
        if (!$recipientStudentId) {
            json_response(['success' => false, 'message' => 'Please select a student for a direct message.'], 422);
        }
        $student = $pdo->prepare('SELECT 1 FROM teacher_students WHERE id = ? AND teacher_id = ?');
        $student->execute([$recipientStudentId, $teacherId]);
        if (!$student->fetchColumn()) {
            json_response(['success' => false, 'message' => 'This student is not assigned to your class.'], 403);
        }
    } elseif ($actor['role'] === 'student' && $isDirect) {
        // Never accept a recipient supplied by a student.
        $recipientStudentId = (int)$actor['id'];
    } elseif ($isDirect) {
        json_response(['success' => false, 'message' => 'Only teachers and students can use direct messages.'], 403);
    } else {
        // Group messages must never accidentally retain a recipient.
        $recipientStudentId = null;
    }
    
    $q = $pdo->prepare("
        INSERT INTO class_messages 
            (teacher_id, sender_role, sender_id, content, is_broadcast, broadcast_id, recipient_student_id, created_at) 
        VALUES 
            (?, ?, ?, ?, 0, NULL, ?, ?)
    ");
    $q->execute([$teacherId, $actor['role'], (int)$actor['id'], $content, $recipientStudentId, $now]);
    $newId = (int)$pdo->lastInsertId();

    $rName = null;
    if ($recipientStudentId) {
        $rName = chat_name($pdo, 'student', $recipientStudentId);
    }
    
    $messagePayload = [
        'id' => $newId,
        'teacher_id' => $teacherId,
        'sender_role' => $actor['role'],
        'sender_id' => (int)$actor['id'],
        'sender_name' => $senderName,
        'recipient_student_id' => $recipientStudentId,
        'recipient_student_name' => $rName,
        'content' => $content,
        'is_broadcast' => false,
        'broadcast_id' => null,
        'created_at' => $now
    ];

    // The WebSocket server broadcasts to every connected browser and has no
    // authenticated per-user subscriptions. Never publish direct content on
    // that channel; the selected student retrieves it through the authenticated
    // messages endpoint. Group messages can still use live broadcast safely.
    if (!$recipientStudentId) {
        class_chat_broadcast_ws([
            'event' => 'new_message',
            'teacher_id' => $teacherId,
            'recipient_student_id' => null,
            'is_broadcast' => false,
            'message' => $messagePayload
        ]);
    }

    json_response([
        'success' => true,
        'message' => $messagePayload
    ]);
}
