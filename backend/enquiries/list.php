<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

require_admin($pdo);

$stmt = $pdo->query('SELECT * FROM enquiries ORDER BY created_at DESC, id DESC');
$enquiries = array_map(function ($row) {
    return [
        'id' => (int) $row['id'],
        'fullName' => $row['full_name'],
        'country' => $row['country'],
        'age' => $row['age'],
        'profession' => $row['profession'],
        'mobile' => $row['mobile'],
        'email' => $row['email'],
        'school' => $row['school'],
        'course' => $row['courses'] ? array_map('trim', explode(',', $row['courses'])) : [],
        'format' => $row['learning_format'],
        'timing' => $row['timing'],
        'message' => $row['message'],
        'status' => $row['status'],
        'date' => date('d-m-Y', strtotime($row['created_at'])),
        'time' => date('h:i A', strtotime($row['created_at'])),
        'created_at' => $row['created_at'],
    ];
}, $stmt->fetchAll());

json_response(['success' => true, 'enquiries' => $enquiries]);
