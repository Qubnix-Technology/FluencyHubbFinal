<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/response.php';

$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (strpos($line, '=') !== false) {
            [$name, $value] = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
        }
    }
}

// Ensure all backend timestamps use Indian Standard Time (Asia/Kolkata)
date_default_timezone_set('Asia/Kolkata');

$host = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'u994782316_fluencyhub';
$username = getenv('DB_USER') ?: 'u994782316_fluencyhub';
$password = getenv('DB_PASS') ?: 'Fluencyhubb@123';

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbName};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_TIMEOUT => 7,
        ]
    );
    // Align MySQL session time to Asia/Kolkata (+05:30)
    @$pdo->exec("SET time_zone = '+05:30'");
} catch (PDOException $exception) {
    $errorMsg = $exception->getMessage();
    $userMsg = 'Database connection failed.';
    if (stripos($errorMsg, 'max_connections_per_hour') !== false) {
        $userMsg = "Hostinger database hourly connection limit exceeded (500 connections/hour). Please wait a few minutes for the limit window to reset, or run 'FLUSH USER_RESOURCES;' in phpMyAdmin.";
    }

    json_response([
        'success' => false,
        'message' => $userMsg,
        'error' => $errorMsg,
    ], 500);
}

function ensure_default_admin(PDO $pdo): void
{
    try {
        $count = (int) $pdo->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
        if ($count > 0) {
            return;
        }

        $stmt = $pdo->prepare('INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)');
        $stmt->execute([
            'Admin',
            'fluencyhubb@gmail.com',
            password_hash('Fluencyhubb@123', PASSWORD_DEFAULT),
        ]);
    } catch (Throwable $e) {
        // Table doesn't exist yet or query failed
    }
}
