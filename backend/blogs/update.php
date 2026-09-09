<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';
require_once __DIR__ . '/helpers.php';

require_admin($pdo);

$id = (int) ($_POST['id'] ?? 0);
if (!$id) {
    json_response(['success' => false, 'message' => 'Blog id is required.'], 422);
}

$stmt = $pdo->prepare('SELECT * FROM blogs WHERE id = ? LIMIT 1');
$stmt->execute([$id]);
$existing = $stmt->fetch();
if (!$existing) {
    json_response(['success' => false, 'message' => 'Blog not found.'], 404);
}

$imageUrl = trim($_POST['image_url'] ?? $existing['image_url']);
$imageFileUrl = $existing['image_file_url'] ?? '';
$uploadedImage = upload_blog_file('image', ['jpg', 'jpeg', 'png', 'webp', 'gif']);
if ($uploadedImage) {
    $imageFileUrl = $uploadedImage;
}

$videoUrl = trim($_POST['video_url'] ?? $existing['video_url']);
$videoFileUrl = $existing['video_file_url'] ?? '';
$uploadedVideo = upload_blog_file('video', ['mp4', 'webm', 'ogg']);
if ($uploadedVideo) {
    $videoFileUrl = $uploadedVideo;
}

try {
    $stmt = $pdo->prepare(
        'UPDATE blogs SET
         title = ?, short_description = ?, content = ?, category = ?, author = ?, publish_date = ?,
         image_url = ?, image_file_url = ?, video_url = ?, video_file_url = ?, tags = ?, facebook_url = ?, twitter_url = ?, linkedin_url = ?,
         whatsapp_number = ?, comments_enabled = ?, status = ?
         WHERE id = ?'
    );
    $stmt->execute([
        trim($_POST['title'] ?? $existing['title']),
        trim($_POST['short_description'] ?? $existing['short_description']),
        trim($_POST['content'] ?? $existing['content']),
        trim($_POST['category'] ?? $existing['category']),
        trim($_POST['author'] ?? $existing['author']),
        trim($_POST['publish_date'] ?? $existing['publish_date']),
        $imageUrl,
        $imageFileUrl,
        $videoUrl,
        $videoFileUrl,
        normalize_tags($_POST['tags'] ?? $existing['tags']),
        trim($_POST['facebook_url'] ?? $existing['facebook_url']),
        trim($_POST['twitter_url'] ?? $existing['twitter_url']),
        trim($_POST['linkedin_url'] ?? $existing['linkedin_url']),
        trim($_POST['whatsapp_number'] ?? $existing['whatsapp_number']),
        (int) (($_POST['comments_enabled'] ?? (string) $existing['comments_enabled']) === '1'),
        $_POST['status'] ?? $existing['status'],
        $id,
    ]);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database Error: ' . $e->getMessage()], 500);
}

json_response(['success' => true, 'message' => 'Blog updated successfully.']);
