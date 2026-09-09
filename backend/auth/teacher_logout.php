<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/teacher_middleware.php';

require_teacher($pdo);

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches);
$plainToken = $matches[1] ?? '';

if ($plainToken) {
    $hashedToken = hash('sha256', $plainToken);
    $stmt = $pdo->prepare('DELETE FROM teacher_tokens WHERE token = ?');
    $stmt->execute([$hashedToken]);
}

json_response(['success' => true, 'message' => 'Logged out successfully.']);
