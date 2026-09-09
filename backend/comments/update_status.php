<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

require_admin($pdo);

$data = read_json_body();
$id = (int) ($data['id'] ?? 0);
$status = $data['status'] ?? '';
$allowed = ['pending', 'approved', 'rejected'];

if (!$id || !in_array($status, $allowed, true)) {
    json_response(['success' => false, 'message' => 'Valid comment id and status are required.'], 422);
}

$stmt = $pdo->prepare('UPDATE comments SET status = ? WHERE id = ?');
$stmt->execute([$status, $id]);

json_response(['success' => true, 'message' => 'Comment status updated.']);
