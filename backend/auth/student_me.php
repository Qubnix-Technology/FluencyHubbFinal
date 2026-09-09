<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/student_middleware.php';

require_student($pdo);

$stmt = $pdo->prepare('
    SELECT 
        ts.*,
        t.name AS teacher_name,
        t.email AS teacher_email,
        t.phone AS teacher_phone,
        t.photo AS teacher_photo,
        t.qualification AS teacher_qualification,
        t.experience AS teacher_experience,
        t.specialization AS teacher_specialization,
        t.languages AS teacher_languages,
        t.teaching_mode AS teacher_teaching_mode
    FROM teacher_students ts 
    LEFT JOIN teachers t ON t.id = ts.teacher_id 
    WHERE ts.id = ? 
    LIMIT 1
');
$stmt->execute([$current_student_id]);
$student = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$student) {
    json_response(['success' => false, 'message' => 'Student not found.'], 404);
}

$pkg = (int) ($student['package_classes'] ?? 0);
$before = (int) ($student['completed_before_week'] ?? 0);
$thisWeek = (int) ($student['this_week_classes'] ?? 0);
$completed = $before + $thisWeek;
$remaining = max($pkg - $completed, 0);

json_response([
    'success' => true,
    'student' => [
        'id' => (int) $student['id'],
        'name' => $student['student_name'] ?? '',
        'email' => $student['email'] ?? '',
        'password' => $student['password'] ?? '',
        'photo' => $student['photo'] ?? '',
        'course' => $student['course_name'] ?? '',
        'duration' => (int) ($student['class_duration'] ?? 30),
        'classType' => $student['class_type'] ?? 'One-to-One',
        'packageClasses' => $pkg,
        'completedBeforeWeek' => $before,
        'thisWeekClasses' => $thisWeek,
        'completedClasses' => $completed,
        'remainingClasses' => $remaining,
        'status' => $student['status'] ?? 'Active',
        'feeStatus' => $student['fee_status'] ?? 'Pending',
        'totalFeesPaid' => (float) ($student['total_fees_paid'] ?? 0),
        'remainingFees' => (float) ($student['remaining_fees'] ?? 0),
        'dueDate' => $student['due_date'] ?? '',
        'teacher' => [
            'id' => (int) ($student['teacher_id'] ?? 0),
            'name' => $student['teacher_name'] ?? 'Not Assigned',
            'email' => $student['teacher_email'] ?? '',
            'phone' => $student['teacher_phone'] ?? '',
            'photo' => $student['teacher_photo'] ?? '',
            'qualification' => $student['teacher_qualification'] ?? '',
            'experience' => $student['teacher_experience'] ?? '',
            'specialization' => $student['teacher_specialization'] ?? '',
            'languages' => $student['teacher_languages'] ?? '',
            'teachingMode' => $student['teacher_teaching_mode'] ?? 'Online',
        ]
    ]
]);


