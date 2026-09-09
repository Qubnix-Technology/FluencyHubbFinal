<?php
date_default_timezone_set('Asia/Kolkata');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../chat/helpers.php';

function zoom_ensure_schema(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS zoom_meetings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        meeting_link TEXT NOT NULL,
        meeting_id VARCHAR(64) NULL,
        passcode VARCHAR(64) NULL,
        teacher_id INT UNSIGNED NOT NULL,
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 60,
        status ENUM('scheduled', 'live', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
        cancel_reason TEXT NULL,
        notes TEXT NULL,
        created_by INT UNSIGNED NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_zoom_teacher (teacher_id, scheduled_date),
        INDEX idx_zoom_status (status),
        CONSTRAINT fk_zoom_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS zoom_meeting_students (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        meeting_id BIGINT UNSIGNED NOT NULL,
        student_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_meeting_student (meeting_id, student_id),
        INDEX idx_student_lookup (student_id),
        CONSTRAINT fk_zms_meeting FOREIGN KEY (meeting_id) REFERENCES zoom_meetings(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Add notes column to existing table if not present
    try {
        $pdo->exec("ALTER TABLE zoom_meetings ADD COLUMN notes TEXT NULL AFTER cancel_reason");
    } catch (Throwable $e) {
        // Column already exists
    }
}

function zoom_broadcast_ws(array $payload): void {
    try {
        $fp = @stream_socket_client('tcp://127.0.0.1:8085', $errno, $errstr, 0.2);
        if ($fp) {
            $json = json_encode($payload);
            $req = "POST /publish HTTP/1.1\r\n" .
                   "Host: 127.0.0.1:8085\r\n" .
                   "Content-Type: application/json\r\n" .
                   "Content-Length: " . strlen($json) . "\r\n" .
                   "Connection: Close\r\n\r\n" .
                   $json;
            fwrite($fp, $req);
            fclose($fp);
        }
    } catch (Throwable $e) {}
}
