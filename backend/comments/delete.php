<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

require_admin($pdo);

$data = read_json_body();
$id = (int) ($data['id'] ?? 0);
if (!$id) {
    json_response(['success' => false, 'message' => 'Comment id is required.'], 422);
}

$stmt = $pdo->prepare('DELETE FROM comments WHERE id = ?');
$stmt->execute([$id]);

json_response(['success' => true, 'message' => 'Comment deleted.']);
