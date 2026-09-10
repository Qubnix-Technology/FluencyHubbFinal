<?php
require_once __DIR__ . '/helpers.php';

function class_chat_ensure_schema(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS class_messages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT UNSIGNED NOT NULL,
        sender_role ENUM('admin','teacher','student') NOT NULL,
        sender_id INT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        is_broadcast TINYINT(1) NOT NULL DEFAULT 0,
        broadcast_id VARCHAR(64) NULL,
        recipient_student_id INT UNSIGNED NULL,
        deleted_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_class_messages_thread (teacher_id, created_at, id),
        INDEX idx_class_broadcast (is_broadcast, deleted_at, created_at),
        INDEX idx_class_recipient (recipient_student_id),
        CONSTRAINT fk_class_messages_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Non-destructive safe addition of recipient_student_id if not present
    try {
        $pdo->exec("ALTER TABLE class_messages ADD COLUMN recipient_student_id INT UNSIGNED NULL AFTER broadcast_id");
    } catch (Throwable $e) {
        // Already exists
    }
}

function class_chat_allowed(PDO $pdo, array $actor, int $teacherId): void {
    class_chat_ensure_schema($pdo);
    if ($actor['role'] === 'admin') return;
    if ($teacherId < 1) json_response(['success' => false, 'message' => 'Invalid class.'], 422);
    if ($actor['role'] === 'teacher' && $actor['id'] === $teacherId) return;
    if ($actor['role'] === 'student') {
        $q = $pdo->prepare('SELECT 1 FROM teacher_students WHERE id=? AND teacher_id=?');
        $q->execute([$actor['id'], $teacherId]);
        if ($q->fetch()) return;
    }
    json_response(['success' => false, 'message' => 'You do not have access to this class chat.'], 403);
}

function class_chat_groups(PDO $pdo, array $actor): array {
    class_chat_ensure_schema($pdo);
    if ($actor['role'] === 'admin') {
        $classes = $pdo->query("SELECT id AS teacher_id, name AS teacher_name, photo AS teacher_photo FROM teachers WHERE (status != 'Inactive' OR status IS NULL) ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
        /*
        array_unshift($classes, [
            'teacher_id' => 0,
            'teacher_name' => 'All Classes (Broadcast Announcement)',
            'is_broadcast' => true
        ]);
        */
        return $classes;
    }
    if ($actor['role'] === 'teacher') return [['teacher_id' => $actor['id'], 'teacher_name' => $actor['name']]];
    $q = $pdo->prepare('SELECT t.id AS teacher_id, t.name AS teacher_name FROM teacher_students s JOIN teachers t ON t.id=s.teacher_id WHERE s.id=?');
    $q->execute([$actor['id']]);
    return $q->fetchAll(PDO::FETCH_ASSOC);
}

function class_chat_ensure_read_schema(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS class_thread_reads (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_role ENUM('admin','teacher','student') NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        teacher_id INT UNSIGNED NOT NULL DEFAULT 0,
        chat_type ENUM('group','direct','broadcast') NOT NULL DEFAULT 'group',
        student_id INT UNSIGNED NOT NULL DEFAULT 0,
        last_read_message_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_thread_read (user_role, user_id, teacher_id, chat_type, student_id),
        INDEX idx_read_lookup (user_role, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

function class_chat_mark_read(PDO $pdo, array $actor, int $teacherId, int $maxMessageId = 0, string $chatType = 'group', int $studentId = 0): void {
    class_chat_ensure_read_schema($pdo);
    $chatType = in_array($chatType, ['group', 'direct', 'broadcast'], true) ? $chatType : 'group';
    if ($chatType === 'direct' && $actor['role'] === 'student') {
        $studentId = (int)$actor['id'];
    }
    if ($chatType !== 'direct') {
        $studentId = 0;
    }

    if ($maxMessageId <= 0) {
        if ($chatType === 'broadcast' || $teacherId === 0) {
            $q = $pdo->query("SELECT MAX(id) FROM class_messages WHERE is_broadcast = 1 AND deleted_at IS NULL");
        } elseif ($chatType === 'direct' && $studentId > 0) {
            $q = $pdo->prepare("
                SELECT MAX(id) FROM class_messages
                WHERE teacher_id = ?
                  AND deleted_at IS NULL
                  AND recipient_student_id = ?
            ");
            $q->execute([$teacherId, $studentId]);
        } else {
            $q = $pdo->prepare("
                SELECT MAX(id) FROM class_messages
                WHERE teacher_id = ?
                  AND deleted_at IS NULL
                  AND recipient_student_id IS NULL
            ");
            $q->execute([$teacherId]);
        }
        $maxMessageId = (int)($q->fetchColumn() ?: 0);
    }

    $stmt = $pdo->prepare("
        INSERT INTO class_thread_reads (user_role, user_id, teacher_id, chat_type, student_id, last_read_message_id)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            last_read_message_id = GREATEST(last_read_message_id, VALUES(last_read_message_id)),
            updated_at = CURRENT_TIMESTAMP
    ");
    $stmt->execute([$actor['role'], (int)$actor['id'], $teacherId, $chatType, $studentId, $maxMessageId]);
}

function class_chat_get_unread_counts(PDO $pdo, array $actor): array {
    class_chat_ensure_read_schema($pdo);
    
    // 1. Determine allowed teacher IDs for this actor
    $allowedTeacherIds = [];
    if ($actor['role'] === 'admin') {
        // Admin has access to all teacher classes
        $allowedTeacherIds = null; // null means all
    } elseif ($actor['role'] === 'teacher') {
        // Teacher has access ONLY to their own class
        $allowedTeacherIds = [(int)$actor['id']];
    } elseif ($actor['role'] === 'student') {
        // Student has access only to classes of their assigned teachers
        $q = $pdo->prepare("SELECT teacher_id FROM teacher_students WHERE id = ?");
        $q->execute([$actor['id']]);
        $allowedTeacherIds = array_map('intval', $q->fetchAll(PDO::FETCH_COLUMN));
    }

    $perChannel = [];
    $perGroup = [];
    $perDirect = [];
    $totalUnread = 0;

    // If teacher or student has specific allowed classes
    if ($allowedTeacherIds !== null && empty($allowedTeacherIds)) {
        return [
            'total_unread' => 0,
            'per_channel' => [],
            'per_group' => [],
            'per_direct' => []
        ];
    }

    if ($allowedTeacherIds !== null) {
        $inPlaceholders = implode(',', array_fill(0, count($allowedTeacherIds), '?'));
        // Class/group unread counts.
        $sql = "
            SELECT cm.teacher_id, COUNT(*) AS unread_cnt
            FROM class_messages cm
            LEFT JOIN class_thread_reads cmr
                ON cmr.teacher_id = cm.teacher_id 
               AND cmr.user_role = ? 
               AND cmr.user_id = ?
               AND cmr.chat_type = 'group'
               AND cmr.student_id = 0
            WHERE cm.deleted_at IS NULL
              AND cm.is_broadcast = 0
              AND cm.teacher_id IN ($inPlaceholders)
              AND cm.recipient_student_id IS NULL
              AND cm.id > COALESCE(cmr.last_read_message_id, 0)
              AND (cm.sender_role != ? OR cm.sender_id != ?)
            GROUP BY cm.teacher_id
        ";
        $params = array_merge([$actor['role'], (int)$actor['id']], $allowedTeacherIds, [$actor['role'], (int)$actor['id']]);
        $unreadStmt = $pdo->prepare($sql);
        $unreadStmt->execute($params);
        foreach ($unreadStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $tId = (int)$row['teacher_id'];
            $cnt = (int)$row['unread_cnt'];
            $perGroup[$tId] = $cnt;
            $perChannel[$tId] = ($perChannel[$tId] ?? 0) + $cnt;
            $totalUnread += $cnt;
        }

        // Direct unread counts. Teachers get one count per student; students get one count per teacher.
        if ($actor['role'] === 'teacher') {
            $directStmt = $pdo->prepare("
                SELECT cm.teacher_id, cm.sender_id AS student_id, COUNT(*) AS unread_cnt
                FROM class_messages cm
                LEFT JOIN class_thread_reads cmr
                    ON cmr.teacher_id = cm.teacher_id
                   AND cmr.user_role = ?
                   AND cmr.user_id = ?
                   AND cmr.chat_type = 'direct'
                   AND cmr.student_id = cm.sender_id
                WHERE cm.deleted_at IS NULL
                  AND cm.is_broadcast = 0
                  AND cm.teacher_id = ?
                  AND cm.recipient_student_id IS NOT NULL
                  AND cm.sender_role = 'student'
                  AND cm.id > COALESCE(cmr.last_read_message_id, 0)
                GROUP BY cm.teacher_id, cm.sender_id
            ");
            $directStmt->execute([$actor['role'], (int)$actor['id'], (int)$actor['id']]);
            foreach ($directStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $tId = (int)$row['teacher_id'];
                $sId = (int)$row['student_id'];
                $cnt = (int)$row['unread_cnt'];
                $perDirect[$tId][$sId] = $cnt;
                $perChannel[$tId] = ($perChannel[$tId] ?? 0) + $cnt;
                $totalUnread += $cnt;
            }
        } elseif ($actor['role'] === 'student') {
            $directSql = "
                SELECT cm.teacher_id, COUNT(*) AS unread_cnt
                FROM class_messages cm
                LEFT JOIN class_thread_reads cmr
                    ON cmr.teacher_id = cm.teacher_id
                   AND cmr.user_role = ?
                   AND cmr.user_id = ?
                   AND cmr.chat_type = 'direct'
                   AND cmr.student_id = ?
                WHERE cm.deleted_at IS NULL
                  AND cm.is_broadcast = 0
                  AND cm.teacher_id IN ($inPlaceholders)
                  AND cm.recipient_student_id = ?
                  AND cm.sender_role = 'teacher'
                  AND cm.id > COALESCE(cmr.last_read_message_id, 0)
                GROUP BY cm.teacher_id
            ";
            $directParams = array_merge([$actor['role'], (int)$actor['id'], (int)$actor['id']], $allowedTeacherIds, [(int)$actor['id']]);
            $directStmt = $pdo->prepare($directSql);
            $directStmt->execute($directParams);
            foreach ($directStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $tId = (int)$row['teacher_id'];
                $cnt = (int)$row['unread_cnt'];
                $perDirect[$tId][(int)$actor['id']] = $cnt;
                $perChannel[$tId] = ($perChannel[$tId] ?? 0) + $cnt;
                $totalUnread += $cnt;
            }
        }
    } else {
        // Admin: all classes
        $unreadStmt = $pdo->prepare("
            SELECT cm.teacher_id, COUNT(*) AS unread_cnt
            FROM class_messages cm
            LEFT JOIN class_thread_reads cmr
                ON cmr.teacher_id = cm.teacher_id 
               AND cmr.user_role = ? 
               AND cmr.user_id = ?
               AND cmr.chat_type = 'group'
               AND cmr.student_id = 0
            WHERE cm.deleted_at IS NULL
              AND cm.is_broadcast = 0
              AND cm.recipient_student_id IS NULL
              AND cm.id > COALESCE(cmr.last_read_message_id, 0)
              AND (cm.sender_role != ? OR cm.sender_id != ?)
            GROUP BY cm.teacher_id
        ");
        $unreadStmt->execute([$actor['role'], (int)$actor['id'], $actor['role'], (int)$actor['id']]);
        foreach ($unreadStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $tId = (int)$row['teacher_id'];
            $cnt = (int)$row['unread_cnt'];
            $perGroup[$tId] = $cnt;
            $perChannel[$tId] = $cnt;
            $totalUnread += $cnt;
        }
    }

    // Broadcast unread: Admin has teacher_id = 0 channel. 
    // Broadcast messages are sent to all teacher classes directly in class_messages table, 
    // so teachers/students receive them in their class thread. Only Admin tracks channel 0 broadcast unread.
    if ($actor['role'] === 'admin') {
        $bStmt = $pdo->prepare("
            SELECT COUNT(DISTINCT broadcast_id) 
            FROM class_messages cm
            LEFT JOIN class_thread_reads cmr
                ON cmr.teacher_id = 0
               AND cmr.user_role = ?
               AND cmr.user_id = ?
               AND cmr.chat_type = 'broadcast'
               AND cmr.student_id = 0
            WHERE is_broadcast = 1 
              AND deleted_at IS NULL 
              AND cm.id > COALESCE(cmr.last_read_message_id, 0)
              AND (sender_role != ? OR sender_id != ?)
        ");
        $bStmt->execute([$actor['role'], (int)$actor['id'], $actor['role'], (int)$actor['id']]);
        $broadcastCount = (int)$bStmt->fetchColumn();
        $perChannel[0] = $broadcastCount;
        $perGroup[0] = $broadcastCount;
        $totalUnread += $broadcastCount;
    }

    return [
        'total_unread' => $totalUnread,
        'per_channel' => $perChannel,
        'per_group' => $perGroup,
        'per_direct' => $perDirect
    ];
}

function class_chat_broadcast_ws(array $payload): void {
    try {
        $fp = @stream_socket_client('tcp://127.0.0.1:8085', $errno, $errstr, 0.2);
        if ($fp) {
            $json = json_encode($payload);
            $req = "POST /publish HTTP/1.1\r\n" .
                   "Host: 127.0.0.1:8085\r\n" .
                   "Content-Type: application/json\r\n" .
                   "Content-Length: " . strlen($json) . "\r\n" .
                   "Connection: close\r\n\r\n" .
                   $json;
            @fwrite($fp, $req);
            @fclose($fp);
        }
    } catch (\Throwable $e) {
        // Never fail HTTP response if websocket daemon is temporarily offline
    }
}

