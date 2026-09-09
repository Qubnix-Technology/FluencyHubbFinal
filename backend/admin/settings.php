<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT setting_key, setting_value FROM settings');
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    json_response(['success' => true, 'settings' => $settings]);
}

require_admin($pdo);
$data = read_json_body();

if (!array_key_exists('global_comments_enabled', $data)) {
    json_response(['success' => false, 'message' => 'global_comments_enabled is required.'], 422);
}

$value = $data['global_comments_enabled'] ? '1' : '0';
$stmt = $pdo->prepare(
    'INSERT INTO settings (setting_key, setting_value) VALUES ("global_comments_enabled", ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
);
$stmt->execute([$value]);

json_response(['success' => true, 'message' => 'Settings updated.']);
