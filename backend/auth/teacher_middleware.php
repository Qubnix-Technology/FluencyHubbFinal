<?php
function require_teacher(PDO $pdo): void
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        json_response(['success' => false, 'message' => 'Unauthorized: Missing token.'], 401);
    }

    $plainToken = $matches[1];
    $hashedToken = hash('sha256', $plainToken);

    $stmt = $pdo->prepare('SELECT teacher_id FROM teacher_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1');
    $stmt->execute([$hashedToken]);
    $teacherId = $stmt->fetchColumn();

    if (!$teacherId) {
        json_response(['success' => false, 'message' => 'Unauthorized: Invalid or expired token.'], 401);
    }

    global $current_teacher_id;
    $current_teacher_id = (int) $teacherId;
}
