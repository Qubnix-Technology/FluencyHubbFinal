<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

require_admin($pdo);

$data = read_json_body();
$teachers = $data['teachers'] ?? [];

if (!is_array($teachers)) {
    json_response(['success' => false, 'message' => 'Invalid teacher payload.'], 422);
}

try {
    $pdo->beginTransaction();

    $pdo->exec('DELETE FROM teacher_students');
    $pdo->exec('DELETE FROM teachers');

    $teacherTableColumns = array_flip($pdo->query('SHOW COLUMNS FROM teachers')->fetchAll(PDO::FETCH_COLUMN));
    $teacherColumnValues = [
        'name' => null,
        'email' => null,
        'phone' => null,
        'password' => null,
        'role' => 'Teacher',
        'status' => 'Active',
        'photo' => null,
        'gender' => null,
        'dob' => null,
        'address' => null,
        'city' => null,
        'country' => null,
        'employee_id' => null,
        'joining_date' => null,
        'qualification' => null,
        'experience' => null,
        'specialization' => null,
        'languages' => null,
        'teaching_mode' => 'Online',
        'created_by' => 'Admin',
        'created_date' => date('Y-m-d'),
    ];
    $teacherInsertColumns = array_values(array_filter(
        array_keys($teacherColumnValues),
        fn($column) => isset($teacherTableColumns[$column])
    ));
    $teacherStmt = $pdo->prepare(sprintf(
        'INSERT INTO teachers (%s) VALUES (%s)',
        implode(', ', $teacherInsertColumns),
        implode(', ', array_fill(0, count($teacherInsertColumns), '?'))
    ));
    $studentStmt = $pdo->prepare(
        'INSERT INTO teacher_students (
            teacher_id,
            student_name,
            email,
            password,
            password_hash,
            course_name,
            class_duration,
            class_type,
            package_classes,
            completed_before_week,
            this_week_classes,
            per_class_rate,
            status,
            fee_status,
            total_fees_paid,
            remaining_fees,
            due_date,
            internal_notes,
            payment_followup_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    foreach ($teachers as $teacher) {
        $name = trim((string) ($teacher['name'] ?? ''));
        if ($name === '') {
            continue;
        }

        $rawPassword = $teacher['password'] ?? null;
        $hashedPassword = null;
        if (!empty($rawPassword)) {
            // User requested that passwords can be viewed by teachers, so it must be stored in plaintext.
            $hashedPassword = $rawPassword;
        }

        $teacherValues = [
            'name' => $name,
            'email' => $teacher['email'] ?? null,
            'phone' => $teacher['phone'] ?? null,
            'password' => $hashedPassword,
            'role' => $teacher['role'] ?? 'Teacher',
            'status' => in_array(($teacher['status'] ?? ''), ['Active', 'Inactive'], true) ? $teacher['status'] : 'Active',
            'photo' => $teacher['photo'] ?? null,
            'gender' => $teacher['gender'] ?? null,
            'dob' => !empty($teacher['dob']) ? $teacher['dob'] : null,
            'address' => $teacher['address'] ?? null,
            'city' => $teacher['city'] ?? null,
            'country' => $teacher['country'] ?? null,
            'employee_id' => $teacher['employeeId'] ?? null,
            'joining_date' => !empty($teacher['joiningDate']) ? $teacher['joiningDate'] : null,
            'qualification' => $teacher['qualification'] ?? null,
            'experience' => $teacher['experience'] ?? null,
            'specialization' => $teacher['specialization'] ?? null,
            'languages' => $teacher['languages'] ?? null,
            'teaching_mode' => $teacher['teachingMode'] ?? 'Online',
            'created_by' => $teacher['createdBy'] ?? 'Admin',
            'created_date' => !empty($teacher['createdDate']) ? $teacher['createdDate'] : date('Y-m-d'),
        ];

        $teacherStmt->execute(array_map(
            fn($column) => $teacherValues[$column],
            $teacherInsertColumns
        ));
        $teacherId = (int) $pdo->lastInsertId();

        foreach (($teacher['students'] ?? []) as $student) {
            $studentName = trim((string) ($student['name'] ?? ''));
            if ($studentName === '') {
                continue;
            }

            $rawEmail = trim((string) ($student['email'] ?? ''));
            $studentEmail = ($rawEmail !== '') ? $rawEmail : null;
            $rawPass = (string) ($student['password'] ?? '');
            $studentPass = ($rawPass !== '') ? $rawPass : null;
            $studentPassHash = ($rawPass !== '') ? password_hash($rawPass, PASSWORD_DEFAULT) : null;

            $studentStmt->execute([
                $teacherId,
                $studentName,
                $studentEmail,
                $studentPass,
                $studentPassHash,
                $student['course'] ?? '',
                (int) ($student['duration'] ?? 30),
                in_array(($student['classType'] ?? ''), ['One-to-One', 'Group'], true) ? $student['classType'] : 'One-to-One',
                max(0, (int) ($student['packageClasses'] ?? 0)),
                max(0, (int) ($student['completedBeforeWeek'] ?? 0)),
                max(0, (int) ($student['thisWeekClasses'] ?? 0)),
                max(0, (float) ($student['rate'] ?? 0)),
                in_array(($student['status'] ?? ''), ['Active', 'Completed', 'On Hold'], true) ? $student['status'] : 'Active',
                $student['feeStatus'] ?? null,
                max(0, (float) ($student['totalFeesPaid'] ?? 0)),
                max(0, (float) ($student['remainingFees'] ?? 0)),
                !empty($student['dueDate']) ? $student['dueDate'] : null,
                $student['internalNotes'] ?? null,
                $student['followUpStatus'] ?? null,
            ]);
        }
    }

    $pdo->commit();
    json_response(['success' => true, 'message' => 'Teacher management details saved.']);
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    json_response([
        'success' => false,
        'message' => 'Unable to save teacher management details.',
        'error' => $exception->getMessage(),
    ], 500);
}
