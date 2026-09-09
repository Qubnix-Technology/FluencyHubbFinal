<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/middleware.php';

$token = get_bearer_token();
if ($token) {
    $stmt = $pdo->prepare('DELETE FROM admin_tokens WHERE token = ?');
    $stmt->execute([hash('sha256', $token)]);
}

json_response(['success' => true]);
