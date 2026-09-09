<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../teacher-management/helpers.php';

$data = read_json_body();
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    json_response(['success' => false, 'message' => 'Email and password are required.'], 422);
}

$stmt = $pdo->prepare('SELECT * FROM teachers WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$teacherRow = $stmt->fetch();

// Also check plain text since existing ones might not be hashed yet
$isValid = false;
if ($teacherRow) {
    if (password_verify($password, $teacherRow['password'] ?? '')) {
        $isValid = true;
    } elseif ($password === $teacherRow['password']) {
        $isValid = true;
    }
}

if (!$isValid) {
    json_response(['success' => false, 'message' => 'Invalid teacher credentials.'], 401);
}

// Update last login
$pdo->prepare('UPDATE teachers SET last_login = NOW() WHERE id = ?')->execute([$teacherRow['id']]);

$plainToken = bin2hex(random_bytes(32));
$hashedToken = hash('sha256', $plainToken);
$expiresAt = (new DateTime('+7 days'))->format('Y-m-d H:i:s');

$stmt = $pdo->prepare('INSERT INTO teacher_tokens (teacher_id, token, expires_at) VALUES (?, ?, ?)');
$stmt->execute([$teacherRow['id'], $hashedToken, $expiresAt]);

// Fetch students for this teacher
$studentStmt = $pdo->prepare('SELECT * FROM teacher_students WHERE teacher_id = ? ORDER BY student_name ASC, id ASC');
$studentStmt->execute([(int) $teacherRow['id']]);
$students = array_map('map_teacher_student', $studentStmt->fetchAll());

json_response([
    'success' => true,
    'token' => $plainToken,
    'teacher' => map_teacher($teacherRow, $students),
]);
