<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

require_admin($pdo);

// Delete requests might send data in body or query param depending on frontend fetch setup.
// Using standard DELETE with query parameter is common, but we will check both.
$data = read_json_body();
$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

if (!$id) {
    json_response(['success' => false, 'message' => 'Enquiry id is required.'], 422);
}

try {
    $stmt = $pdo->prepare('DELETE FROM enquiries WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        json_response(['success' => true, 'message' => 'Enquiry deleted successfully.']);
    } else {
        json_response(['success' => false, 'message' => 'Enquiry not found or already deleted.'], 404);
    }
} catch (PDOException $e) {
    json_response(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
}
