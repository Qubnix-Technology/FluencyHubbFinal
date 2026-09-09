<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/class_helpers.php';

$actor = chat_actor($pdo);
$groups = class_chat_groups($pdo, $actor);

$unreadData = class_chat_get_unread_counts($pdo, $actor);
$perChannelUnread = $unreadData['per_channel'] ?? [];

// Pre-fetch latest messages in batch for all teachers
// 1) Non-broadcast latest message per teacher
$latestNonBroadcastStmt = $pdo->query("
    SELECT cm.id, cm.teacher_id, cm.content, cm.created_at, cm.sender_role, cm.sender_id, cm.is_broadcast
    FROM class_messages cm
    INNER JOIN (
        SELECT teacher_id, MAX(id) AS max_id
        FROM class_messages
        WHERE is_broadcast = 0 AND deleted_at IS NULL
        GROUP BY teacher_id
    ) latest ON cm.id = latest.max_id
");
$latestByTeacher = [];
while ($row = $latestNonBroadcastStmt->fetch(PDO::FETCH_ASSOC)) {
    $latestByTeacher[(int)$row['teacher_id']] = $row;
}

// 2) Broadcast latest message
$latestBroadcastStmt = $pdo->query("
    SELECT id, content, created_at, sender_role, sender_id, is_broadcast 
    FROM class_messages 
    WHERE is_broadcast = 1 AND deleted_at IS NULL 
    ORDER BY id DESC 
    LIMIT 1
");
$latestBroadcast = $latestBroadcastStmt->fetch(PDO::FETCH_ASSOC);

// Map teacher names cache to avoid repeated queries in chat_name
$teacherNames = [];
if (!empty($groups)) {
    foreach ($groups as $g) {
        if (!empty($g['teacher_id']) && !empty($g['teacher_name'])) {
            $teacherNames[(int)$g['teacher_id']] = $g['teacher_name'];
        }
    }
}

foreach ($groups as &$group) {
    $group['teacher_id'] = (int)$group['teacher_id'];
    $group['unread_count'] = (int)($perChannelUnread[$group['teacher_id']] ?? 0);
    
    $latest = ($group['teacher_id'] === 0) 
        ? $latestBroadcast 
        : ($latestByTeacher[$group['teacher_id']] ?? null);

    if ($latest) {
        $senderName = 'Teacher';
        if ($latest['sender_role'] === 'admin') {
            $senderName = 'Admin';
        } elseif ($latest['sender_role'] === 'teacher') {
            $sId = (int)$latest['sender_id'];
            $senderName = $teacherNames[$sId] ?? ('Teacher #' . $sId);
        } else {
            $senderName = chat_name($pdo, $latest['sender_role'], (int)$latest['sender_id']) ?: ucfirst($latest['sender_role']);
        }

        $group['latest'] = [
            'id' => (int)$latest['id'],
            'content' => $latest['content'],
            'created_at' => $latest['created_at'],
            'sender_role' => $latest['sender_role'],
            'sender_id' => (int)$latest['sender_id'],
            'sender_name' => $senderName,
            'is_broadcast' => (bool)($latest['is_broadcast'] ?? false),
        ];
    } else {
        $group['latest'] = null;
    }
}

// WhatsApp-style dynamic sorting:
// 1. Pinned: Broadcast (teacher_id === 0) is always #1 at the very top.
// 2. Dynamic: Other channels sort by most recent message (created_at DESC).
// 3. Fallback: Channels without messages sort alphabetically by name below.
usort($groups, function ($a, $b) {
    if ((int)$a['teacher_id'] === 0) return -1;
    if ((int)$b['teacher_id'] === 0) return 1;

    $timeA = !empty($a['latest']['created_at']) ? strtotime($a['latest']['created_at']) : 0;
    $timeB = !empty($b['latest']['created_at']) ? strtotime($b['latest']['created_at']) : 0;

    if ($timeA !== $timeB) {
        return $timeB <=> $timeA; // Newest message first
    }

    return strcasecmp($a['teacher_name'] ?? '', $b['teacher_name'] ?? '');
});

json_response([
    'success' => true, 
    'actor' => $actor, 
    'groups' => $groups,
    'total_unread' => (int)$unreadData['total_unread']
]);


