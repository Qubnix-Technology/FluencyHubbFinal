<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/middleware.php';

$admin = require_admin($pdo);
json_response(['success' => true, 'admin' => $admin]);
