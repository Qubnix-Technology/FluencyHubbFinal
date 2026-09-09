<?php
require_once __DIR__ . '/../config/database.php';

$data = read_json_body();
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    json_response(['success' => false, 'message' => 'Email and password are required.'], 422);
}

$stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM admin_users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$admin = $stmt->fetch();

if (!$admin) {
    ensure_default_admin($pdo);
    $stmt->execute([$email]);
    $admin = $stmt->fetch();
}

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    json_response(['success' => false, 'message' => 'Invalid admin credentials.'], 401);
}

$plainToken = bin2hex(random_bytes(32));
$hashedToken = hash('sha256', $plainToken);
$expiresAt = (new DateTime('+7 days'))->format('Y-m-d H:i:s');

$stmt = $pdo->prepare('INSERT INTO admin_tokens (admin_id, token, expires_at) VALUES (?, ?, ?)');
$stmt->execute([$admin['id'], $hashedToken, $expiresAt]);

json_response([
    'success' => true,
    'token' => $plainToken,
    'admin' => [
        'id' => (int) $admin['id'],
        'name' => $admin['name'],
        'email' => $admin['email'],
    ],
]);
