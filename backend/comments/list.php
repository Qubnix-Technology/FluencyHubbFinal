<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

$publicMode = ($_GET['public'] ?? '') === '1';
$blogId = (int) ($_GET['blog_id'] ?? 0);

if (!$publicMode) {
    require_admin($pdo);
}

$where = [];
$params = [];
if ($blogId) {
    $where[] = 'comments.blog_id = ?';
    $params[] = $blogId;
}
if ($publicMode) {
    $where[] = 'comments.status = "approved"';
}

$sql = 'SELECT comments.*, blogs.title AS blog_title
        FROM comments
        INNER JOIN blogs ON comments.blog_id = blogs.id';
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY comments.created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$comments = array_map(function ($comment) {
    $comment['id'] = (int) $comment['id'];
    $comment['blog_id'] = (int) $comment['blog_id'];
    return $comment;
}, $stmt->fetchAll());

json_response(['success' => true, 'comments' => $comments]);
