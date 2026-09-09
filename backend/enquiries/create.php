<?php
require_once __DIR__ . '/../config/database.php';

$data = read_json_body();

$fullName = trim($data['fullName'] ?? '');
$country = trim($data['country'] ?? '');
$mobile = trim($data['mobile'] ?? '');
$email = trim($data['email'] ?? '');
$school = trim($data['school'] ?? '');
$courses = $data['course'] ?? [];

if (!$fullName || !$country || !$mobile || !$email || !$school || empty($courses)) {
    json_response(['success' => false, 'message' => 'Required enquiry details are missing.'], 422);
}

if (is_array($courses)) {
    $courses = implode(', ', array_filter(array_map('trim', $courses)));
}

$stmt = $pdo->prepare(
    'INSERT INTO enquiries
     (full_name, country, age, profession, mobile, email, school, courses, learning_format, timing, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $fullName,
    $country,
    trim($data['age'] ?? ''),
    trim($data['profession'] ?? ''),
    $mobile,
    $email,
    $school,
    $courses,
    trim($data['format'] ?? ''),
    trim($data['timing'] ?? ''),
    trim($data['message'] ?? ''),
    'New',
]);

json_response([
    'success' => true,
    'message' => 'Enquiry submitted successfully.',
    'id' => (int) $pdo->lastInsertId(),
], 201);
