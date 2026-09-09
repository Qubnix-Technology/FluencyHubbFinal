<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

require_admin($pdo);

$data = read_json_body();
$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);
if (!$id) {
    json_response(['success' => false, 'message' => 'Blog id is required.'], 422);
}

$stmt = $pdo->prepare('DELETE FROM blogs WHERE id = ?');
$stmt->execute([$id]);

json_response(['success' => true, 'message' => 'Blog deleted successfully.']);
