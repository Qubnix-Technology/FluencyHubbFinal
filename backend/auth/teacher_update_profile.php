<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../teacher-management/helpers.php';
require_once __DIR__ . '/teacher_middleware.php';

require_teacher($pdo);

// Fetch current teacher
$stmt = $pdo->prepare('SELECT * FROM teachers WHERE id = ? LIMIT 1');
$stmt->execute([$current_teacher_id]);
$teacher = $stmt->fetch();

if (!$teacher) {
    json_response(['success' => false, 'message' => 'Teacher not found.'], 404);
}

// Since it's multipart/form-data, we use $_POST
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$gender = trim($_POST['gender'] ?? '');
$dob = !empty($_POST['dob']) ? trim($_POST['dob']) : null;
$address = trim($_POST['address'] ?? '');
$city = trim($_POST['city'] ?? '');
$country = trim($_POST['country'] ?? '');
$qualification = trim($_POST['qualification'] ?? '');
$experience = trim($_POST['experience'] ?? '');
$specialization = trim($_POST['specialization'] ?? '');

$password = $teacher['password']; // Always keep old password

$photoPath = $teacher['photo'];

// Handle photo upload
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['photo']['tmp_name'];
    $fileName = $_FILES['photo']['name'];
    $fileSize = $_FILES['photo']['size'];
    $fileType = $_FILES['photo']['type'];
    
    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($fileType, $allowedMimeTypes)) {
        json_response(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'], 400);
    }
    
    // Max 5MB
    if ($fileSize > 5 * 1024 * 1024) {
        json_response(['success' => false, 'message' => 'File size exceeds the 5MB limit.'], 400);
    }
    
    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
    
    $uploadDir = __DIR__ . '/../uploads/teachers/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $destPath = $uploadDir . $newFileName;
    
    if (move_uploaded_file($fileTmpPath, $destPath)) {
        // Delete old photo if it exists
        if ($photoPath && file_exists(__DIR__ . '/../' . $photoPath)) {
            @unlink(__DIR__ . '/../' . $photoPath);
        }
        $photoPath = 'uploads/teachers/' . $newFileName;
    } else {
        json_response(['success' => false, 'message' => 'Failed to upload photo.'], 500);
    }
}

try {
    $updateStmt = $pdo->prepare('
        UPDATE teachers 
        SET name = ?, email = ?, phone = ?, gender = ?, dob = ?, address = ?, city = ?, country = ?, qualification = ?, experience = ?, specialization = ?, password = ?, photo = ?
        WHERE id = ?
    ');
    $updateStmt->execute([
        $name, $email, $phone, $gender, $dob, $address, $city, $country, $qualification, $experience, $specialization, $password, $photoPath, $current_teacher_id
    ]);

    // Fetch updated teacher data
    $stmt->execute([$current_teacher_id]);
    $updatedTeacher = $stmt->fetch();

    // Fetch students for this teacher
    $studentStmt = $pdo->prepare('SELECT * FROM teacher_students WHERE teacher_id = ? ORDER BY student_name ASC, id ASC');
    $studentStmt->execute([(int) $updatedTeacher['id']]);
    $students = array_map('map_teacher_student', $studentStmt->fetchAll());

    json_response([
        'success' => true,
        'message' => 'Profile updated successfully.',
        'teacher' => map_teacher($updatedTeacher, $students),
    ]);
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Failed to update profile.', 'error' => $e->getMessage()], 500);
}
