<?php
function map_teacher_student(array $row): array
{
    $packageClasses = (int) $row['package_classes'];
    $completedBeforeWeek = (int) $row['completed_before_week'];
    $thisWeekClasses = (int) $row['this_week_classes'];
    $completedClasses = $completedBeforeWeek + $thisWeekClasses;
    $rate = (float) $row['per_class_rate'];

    return [
        'id' => (int) $row['id'],
        'name' => $row['student_name'],
        'email' => $row['email'] ?? '',
        'password' => $row['password'] ?? '',
        'course' => $row['course_name'],
        'duration' => (int) $row['class_duration'],
        'classType' => $row['class_type'],
        'packageClasses' => $packageClasses,
        'completedBeforeWeek' => $completedBeforeWeek,
        'thisWeekClasses' => $thisWeekClasses,
        'rate' => $rate,
        'status' => $row['status'],
        'feeStatus' => $row['fee_status'],
        'totalFeesPaid' => (float) $row['total_fees_paid'],
        'remainingFees' => (float) $row['remaining_fees'],
        'dueDate' => $row['due_date'],
        'internalNotes' => $row['internal_notes'],
        'followUpStatus' => $row['payment_followup_status'],
        'completedClasses' => $completedClasses,
        'remainingClasses' => max($packageClasses - $completedClasses, 0),
        'weeklyPayment' => $thisWeekClasses * $rate,
    ];
}

function map_teacher(array $teacher, array $students): array
{
    return [
        'id' => (int) $teacher['id'],
        'name' => $teacher['name'],
        'email' => $teacher['email'],
        'phone' => $teacher['phone'],
        'password' => $teacher['password'] ?? '',
        'role' => $teacher['role'] ?? 'Teacher',
        'status' => $teacher['status'] ?? 'Active',
        'photo' => $teacher['photo'] ?? '',
        'gender' => $teacher['gender'] ?? '',
        'dob' => $teacher['dob'] ?? '',
        'address' => $teacher['address'] ?? '',
        'city' => $teacher['city'] ?? '',
        'country' => $teacher['country'] ?? '',
        'employeeId' => $teacher['employee_id'] ?? '',
        'joiningDate' => $teacher['joining_date'] ?? '',
        'qualification' => $teacher['qualification'] ?? '',
        'experience' => $teacher['experience'] ?? '',
        'specialization' => $teacher['specialization'] ?? '',
        'languages' => $teacher['languages'] ?? '',
        'teachingMode' => $teacher['teaching_mode'] ?? 'Online',
        'lastLogin' => $teacher['last_login'] ?? '',
        'createdBy' => $teacher['created_by'] ?? 'Admin',
        'createdDate' => $teacher['created_date'] ?? '',
        'students' => $students,
    ];
}
