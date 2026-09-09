<?php
require_once __DIR__ . '/../config/database.php';

$data = read_json_body();
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    json_response(['success' => false, 'message' => 'Email and password are required.'], 422);
}

$stmt = $pdo->prepare('SELECT id, teacher_id, student_name, email, password, password_hash, status FROM teacher_students WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$student = $stmt->fetch(PDO::FETCH_ASSOC);

$isValid = false;
if ($student) {
    if (!empty($student['password_hash']) && password_verify($password, $student['password_hash'])) {
        $isValid = true;
    } elseif (!empty($student['password']) && $password === $student['password']) {
        $isValid = true;
    } elseif (!empty($student['password_hash']) && $password === $student['password_hash']) {
        $isValid = true;
    }
}

if (!$isValid) {
    json_response(['success' => false, 'message' => 'Invalid student email or password.'], 401);
}

if (($student['status'] ?? 'Active') === 'Inactive') {
    json_response(['success' => false, 'message' => 'Your student account is currently inactive. Please contact administration.'], 403);
}

$plainToken = bin2hex(random_bytes(32));
$hashedToken = hash('sha256', $plainToken);
$expiresAt = (new DateTime('+7 days'))->format('Y-m-d H:i:s');

$tokenStmt = $pdo->prepare('INSERT INTO student_tokens (student_id, token, expires_at) VALUES (?, ?, ?)');
$tokenStmt->execute([(int)$student['id'], $hashedToken, $expiresAt]);

json_response([
    'success' => true,
    'token' => $plainToken,
    'student' => [
        'id' => (int)$student['id'],
        'teacher_id' => (int)$student['teacher_id'],
        'name' => $student['student_name'],
        'email' => $student['email']
    ]
]);
