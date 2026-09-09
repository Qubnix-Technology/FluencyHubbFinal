<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';
require_once __DIR__ . '/helpers.php';

require_admin($pdo);

$title = trim($_POST['title'] ?? '');
$shortDescription = trim($_POST['short_description'] ?? '');
$content = trim($_POST['content'] ?? '');
$category = trim($_POST['category'] ?? '');
$author = trim($_POST['author'] ?? '');
$publishDate = trim($_POST['publish_date'] ?? '');

if (!$title || !$shortDescription || !$content || !$category || !$author || !$publishDate) {
    json_response(['success' => false, 'message' => 'Title, description, content, category, author, and date are required.'], 422);
}

$imageUrl = trim($_POST['image_url'] ?? '');
$videoUrl = trim($_POST['video_url'] ?? '');
$imageFileUrl = upload_blog_file('image', ['jpg', 'jpeg', 'png', 'webp', 'gif']);
$videoFileUrl = upload_blog_file('video', ['mp4', 'webm', 'ogg']);

try {
    $stmt = $pdo->prepare(
        'INSERT INTO blogs
         (title, short_description, content, category, author, publish_date, image_url, image_file_url, video_url, video_file_url, tags, facebook_url, twitter_url, linkedin_url, whatsapp_number, comments_enabled, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $title,
        $shortDescription,
        $content,
        $category,
        $author,
        $publishDate,
        $imageUrl,
        $imageFileUrl,
        $videoUrl,
        $videoFileUrl,
        normalize_tags($_POST['tags'] ?? ''),
        trim($_POST['facebook_url'] ?? ''),
        trim($_POST['twitter_url'] ?? ''),
        trim($_POST['linkedin_url'] ?? ''),
        trim($_POST['whatsapp_number'] ?? ''),
        (int) (($_POST['comments_enabled'] ?? '1') === '1'),
        $_POST['status'] ?? 'published',
    ]);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database Error: ' . $e->getMessage()], 500);
}

json_response(['success' => true, 'message' => 'Blog created successfully.', 'id' => (int) $pdo->lastInsertId()], 201);
