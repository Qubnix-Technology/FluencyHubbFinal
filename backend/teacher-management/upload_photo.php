<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

require_admin($pdo);

if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['photo']['tmp_name'];
    $fileName = $_FILES['photo']['name'];
    $fileSize = $_FILES['photo']['size'];
    $fileType = $_FILES['photo']['type'];
    
    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($fileType, $allowedMimeTypes)) {
        json_response(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'], 400);
    }
    
    if ($fileSize > 5 * 1024 * 1024) {
        json_response(['success' => false, 'message' => 'File size exceeds 5MB limit.'], 400);
    }
    
    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
    
    $uploadDir = __DIR__ . '/../uploads/teachers/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $destPath = $uploadDir . $newFileName;
    
    if (move_uploaded_file($fileTmpPath, $destPath)) {
        json_response(['success' => true, 'photoUrl' => 'uploads/teachers/' . $newFileName]);
    } else {
        json_response(['success' => false, 'message' => 'Failed to move uploaded file.'], 500);
    }
} else {
    json_response(['success' => false, 'message' => 'No file uploaded or upload error.'], 400);
}
