<?php
require_once __DIR__ . '/../config/database.php';

$data = read_json_body();
$blogId = (int) ($data['blog_id'] ?? 0);
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$comment = trim($data['comment'] ?? '');

if (!$blogId || !$name || !$email || !$comment) {
    json_response(['success' => false, 'message' => 'Name, email, and comment are required.'], 422);
}

$stmt = $pdo->prepare('SELECT comments_enabled FROM blogs WHERE id = ? AND status = "published" LIMIT 1');
$stmt->execute([$blogId]);
$blog = $stmt->fetch();

if (!$blog) {
    json_response(['success' => false, 'message' => 'Blog not found.'], 404);
}

if (!(bool) $blog['comments_enabled']) {
    json_response(['success' => false, 'message' => 'Comments are disabled for this blog.'], 403);
}

$stmt = $pdo->prepare('INSERT INTO comments (blog_id, name, email, comment, status) VALUES (?, ?, ?, ?, "pending")');
$stmt->execute([$blogId, $name, $email, $comment]);

json_response(['success' => true, 'message' => 'Comment submitted for admin review.'], 201);
