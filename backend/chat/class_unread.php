<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/class_helpers.php';

$actor = chat_actor($pdo);
$unreadData = class_chat_get_unread_counts($pdo, $actor);

json_response([
    'success' => true,
    'actor' => $actor,
    'total_unread' => (int)$unreadData['total_unread'],
    'per_channel' => $unreadData['per_channel']
]);
