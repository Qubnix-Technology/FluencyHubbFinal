<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/helpers.php';

$category = trim($_GET['category'] ?? '');
$adminMode = ($_GET['admin'] ?? '') === '1';

$where = [];
$params = [];
if (!$adminMode) {
    $where[] = 'blogs.status = ?';
    $params[] = 'published';
}
if ($category && $category !== 'All') {
    $where[] = 'blogs.category = ?';
    $params[] = $category;
}

$sql = 'SELECT blogs.*, COUNT(comments.id) AS comment_count
        FROM blogs
        LEFT JOIN comments ON comments.blog_id = blogs.id AND comments.status = "approved"';
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' GROUP BY blogs.id ORDER BY blogs.publish_date DESC, blogs.id DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$blogs = array_map('blog_payload', $stmt->fetchAll());

json_response(['success' => true, 'blogs' => $blogs]);
