<?php
function require_student(PDO $pdo): void
{
    $headers = getallheaders();
    $header = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/i', $header, $matches)) json_response(['success' => false, 'message' => 'Student login required.'], 401);
    $stmt = $pdo->prepare('SELECT student_id FROM student_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1');
    $stmt->execute([hash('sha256', trim($matches[1]))]);
    $id = $stmt->fetchColumn();
    if (!$id) json_response(['success' => false, 'message' => 'Invalid or expired student session.'], 401);
    global $current_student_id; $current_student_id = (int) $id;
}
