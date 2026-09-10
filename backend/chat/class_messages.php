<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/class_helpers.php';

$actor = chat_actor($pdo);
$teacherId = (int)($_GET['teacher_id'] ?? 0);
class_chat_allowed($pdo, $actor, $teacherId);
$chatType = trim($_GET['chat_type'] ?? '');
$filterStudentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;

if ($teacherId === 0 && $actor['role'] === 'admin') {
    // Admin viewing ONLY Broadcast Announcements across all classes
    $q = $pdo->query('
        SELECT 
            MIN(id) AS id,
            0 AS teacher_id,
            sender_role,
            sender_id,
            content,
            broadcast_id,
            1 AS is_broadcast,
            deleted_at,
            created_at
        FROM class_messages 
        WHERE is_broadcast = 1 AND deleted_at IS NULL 
        GROUP BY broadcast_id, content, created_at, sender_role, sender_id 
        ORDER BY created_at ASC, id ASC 
        LIMIT 200
    ');
    $messages = $q->fetchAll(PDO::FETCH_ASSOC);
} else {
    // Check if channel filter was specified: 'group' (all class) or 'direct' (with student_id)
    if ($actor['role'] === 'student') {
        // A student can ONLY see:
        // 1. Group messages (recipient_student_id IS NULL)
        // 2. Direct messages addressed to THIS student (recipient_student_id = student's ID)
        // 3. Direct messages sent by THIS student (sender_role = 'student' AND sender_id = student's ID)
        $studentId = (int)$actor['id'];
        if ($chatType === 'direct') {
            $q = $pdo->prepare('
                SELECT * FROM class_messages 
                WHERE teacher_id = ? 
                  AND deleted_at IS NULL 
                  AND (
                      (recipient_student_id = ? AND sender_role = "teacher") 
                      OR 
                      (sender_role = "student" AND sender_id = ? AND recipient_student_id IS NOT NULL)
                  )
                ORDER BY created_at ASC, id ASC
            ');
            $q->execute([$teacherId, $studentId, $studentId]);
        } elseif ($chatType === 'group') {
            $q = $pdo->prepare('
                SELECT * FROM class_messages 
                WHERE teacher_id = ? 
                  AND deleted_at IS NULL 
                  AND recipient_student_id IS NULL
                ORDER BY created_at ASC, id ASC
            ');
            $q->execute([$teacherId]);
        } else {
            // General query: all visible to this student
            $q = $pdo->prepare('
                SELECT * FROM class_messages 
                WHERE teacher_id = ? 
                  AND deleted_at IS NULL 
                  AND (
                      recipient_student_id IS NULL 
                      OR recipient_student_id = ? 
                      OR (sender_role = "student" AND sender_id = ?)
                  )
                ORDER BY created_at ASC, id ASC
            ');
            $q->execute([$teacherId, $studentId, $studentId]);
        }
    } elseif ($actor['role'] === 'teacher') {
        // Teacher viewing
        if ($chatType === 'direct' && $filterStudentId > 0) {
            $q = $pdo->prepare('
                SELECT * FROM class_messages 
                WHERE teacher_id = ? 
                  AND deleted_at IS NULL 
                  AND (
                      (recipient_student_id = ? AND sender_role = "teacher")
                      OR
                      (sender_role = "student" AND sender_id = ? AND recipient_student_id IS NOT NULL)
                  )
                ORDER BY created_at ASC, id ASC
            ');
            $q->execute([$teacherId, $filterStudentId, $filterStudentId]);
        } elseif ($chatType === 'group') {
            $q = $pdo->prepare('
                SELECT * FROM class_messages 
                WHERE teacher_id = ? 
                  AND deleted_at IS NULL 
                  AND recipient_student_id IS NULL
                ORDER BY created_at ASC, id ASC
            ');
            $q->execute([$teacherId]);
        } else {
            // Default to group (safe fallback: never expose direct messages without explicit request)
            $q = $pdo->prepare('
                SELECT * FROM class_messages 
                WHERE teacher_id = ? 
                  AND deleted_at IS NULL 
                  AND recipient_student_id IS NULL
                ORDER BY created_at ASC, id ASC
            ');
            $q->execute([$teacherId]);
        }
    } else {
        // Admin access is intentionally limited to class discussion messages.
        // Do not add a direct-message branch here: this endpoint is the
        // privacy boundary which keeps teacher/student conversations private.
        $q = $pdo->prepare('
            SELECT * FROM class_messages
            WHERE teacher_id = ?
              AND deleted_at IS NULL
              AND recipient_student_id IS NULL
            ORDER BY created_at ASC, id ASC
        ');
        $q->execute([$teacherId]);
    }
    $messages = $q->fetchAll(PDO::FETCH_ASSOC);
}

// Automatically mark channel as read up to the latest message
if (!empty($messages)) {
    $lastMsg = end($messages);
    $maxMsgId = (int)($lastMsg['id'] ?? 0);
    $readType = ($teacherId === 0 && $actor['role'] === 'admin') ? 'broadcast' : ($chatType === 'direct' ? 'direct' : 'group');
    $readStudentId = $readType === 'direct'
        ? ($actor['role'] === 'student' ? (int)$actor['id'] : (int)$filterStudentId)
        : 0;
    class_chat_mark_read($pdo, $actor, $teacherId, $maxMsgId, $readType, $readStudentId);
} else {
    $readType = ($teacherId === 0 && $actor['role'] === 'admin') ? 'broadcast' : ($chatType === 'direct' ? 'direct' : 'group');
    $readStudentId = $readType === 'direct'
        ? ($actor['role'] === 'student' ? (int)$actor['id'] : (int)$filterStudentId)
        : 0;
    class_chat_mark_read($pdo, $actor, $teacherId, 0, $readType, $readStudentId);
}


foreach ($messages as &$message) {
    $message['id'] = (int)$message['id'];
    $message['teacher_id'] = (int)$message['teacher_id'];
    $message['sender_id'] = (int)$message['sender_id'];
    $message['recipient_student_id'] = !empty($message['recipient_student_id']) ? (int)$message['recipient_student_id'] : null;
    $message['is_broadcast'] = (bool)($message['is_broadcast'] ?? false);
    if ($message['sender_role'] === 'admin') {
        $message['sender_name'] = 'Admin';
    } else {
        $name = chat_name($pdo, $message['sender_role'], $message['sender_id']);
        $message['sender_name'] = $name ?: ucfirst($message['sender_role']);
    }
    if ($message['recipient_student_id']) {
        $rName = chat_name($pdo, 'student', $message['recipient_student_id']);
        $message['recipient_student_name'] = $rName ?: 'Student';
    } else {
        $message['recipient_student_name'] = null;
    }
}

json_response([
    'success' => true,
    'current_user_id' => (int)$actor['id'],
    'current_role' => $actor['role'],
    'messages' => $messages
]);
