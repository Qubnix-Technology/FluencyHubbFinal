<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/class_helpers.php';

$actor = chat_actor($pdo);
if ($actor['role'] !== 'teacher' && $actor['role'] !== 'admin') {
    json_response(['success' => false, 'message' => 'Access restricted to teachers and admin.'], 403);
}

$teacherId = (int)($_GET['teacher_id'] ?? 0);
if ($teacherId <= 0 && $actor['role'] === 'teacher') {
    $teacherId = (int)$actor['id'];
}
if ($teacherId <= 0) {
    json_response(['success' => false, 'message' => 'Invalid teacher ID.'], 422);
}

$stmt = $pdo->prepare("
    SELECT id, student_name, email, course_name AS course, status 
    FROM teacher_students 
    WHERE teacher_id = ? 
    ORDER BY student_name ASC
");
$stmt->execute([$teacherId]);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);
$unreadData = class_chat_get_unread_counts($pdo, $actor);
$directUnread = $unreadData['per_direct'][$teacherId] ?? [];

$latestStmt = $pdo->prepare("
    SELECT
        id,
        sender_role,
        sender_id,
        recipient_student_id,
        content,
        created_at
    FROM class_messages
    WHERE teacher_id = ?
      AND deleted_at IS NULL
      AND recipient_student_id IS NOT NULL
    ORDER BY id DESC
");
$latestStmt->execute([$teacherId]);
$latestByStudent = [];
foreach ($latestStmt->fetchAll(PDO::FETCH_ASSOC) as $message) {
    $studentId = $message['sender_role'] === 'student'
        ? (int)$message['sender_id']
        : (int)$message['recipient_student_id'];
    if ($studentId > 0 && !isset($latestByStudent[$studentId])) {
        $latestByStudent[$studentId] = [
            'id' => (int)$message['id'],
            'content' => $message['content'],
            'created_at' => $message['created_at'],
            'sender_role' => $message['sender_role'],
            'sender_id' => (int)$message['sender_id'],
        ];
    }
}

json_response([
    'success' => true,
    'teacher_id' => $teacherId,
    'students' => array_map(function($s) use ($directUnread, $latestByStudent) {
        $studentId = (int)$s['id'];
        return [
            'id' => $studentId,
            'student_name' => $s['student_name'],
            'email' => $s['email'] ?? '',
            'course' => $s['course'] ?? '',
            'status' => $s['status'] ?? 'Active',
            'unread_count' => (int)($directUnread[$studentId] ?? 0),
            'latest_direct' => $latestByStudent[$studentId] ?? null,
        ];
    }, $students)
]);
