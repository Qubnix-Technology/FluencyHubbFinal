<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/helpers.php';

$id = (int) ($_GET['id'] ?? 0);
if (!$id) {
    json_response(['success' => false, 'message' => 'Blog id is required.'], 422);
}

$stmt = $pdo->prepare(
    'SELECT blogs.*, COUNT(comments.id) AS comment_count
     FROM blogs
     LEFT JOIN comments ON comments.blog_id = blogs.id AND comments.status = "approved"
     WHERE blogs.id = ?
     GROUP BY blogs.id
     LIMIT 1'
);
$stmt->execute([$id]);
$blog = $stmt->fetch();

if (!$blog) {
    json_response(['success' => false, 'message' => 'Blog not found.'], 404);
}

json_response(['success' => true, 'blog' => blog_payload($blog)]);
