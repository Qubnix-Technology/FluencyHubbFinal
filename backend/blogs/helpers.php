<?php
function normalize_tags($tags): string
{
    if (is_array($tags)) {
        return implode(',', array_filter(array_map('trim', $tags)));
    }
    return implode(',', array_filter(array_map('trim', explode(',', (string) $tags))));
}

function upload_blog_file(string $field, array $allowedExtensions): ?string
{
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        json_response(['success' => false, 'message' => "Upload failed for {$field}."], 422);
    }

    $extension = strtolower(pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        json_response(['success' => false, 'message' => "Invalid {$field} file type."], 422);
    }

    $uploadDir = __DIR__ . '/../uploads/blogs/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $filename = $field . '_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
    $target = $uploadDir . $filename;

    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $target)) {
        json_response(['success' => false, 'message' => "Could not save {$field} file."], 500);
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/\\');
    return "{$scheme}://{$host}{$basePath}/uploads/blogs/{$filename}";
}

function blog_payload(array $row): array
{
    $row['id'] = (int) $row['id'];
    $row['comments_enabled'] = (bool) $row['comments_enabled'];
    $row['tags'] = $row['tags'] ? array_values(array_filter(array_map('trim', explode(',', $row['tags'])))) : [];
    $row['comment_count'] = isset($row['comment_count']) ? (int) $row['comment_count'] : 0;
    $row['image_file_url'] = $row['image_file_url'] ?? '';
    $row['video_file_url'] = $row['video_file_url'] ?? '';
    $row['image_src'] = $row['image_file_url'] ?: ($row['image_url'] ?? '');
    $row['video_src'] = $row['video_file_url'] ?: ($row['video_url'] ?? '');
    return $row;
}
