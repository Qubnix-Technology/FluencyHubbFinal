<?php
/**
 * FluencyHub Database Seeder & Initializer CLI Runner
 * Usage: php backend/database/seed.php
 */

require_once __DIR__ . '/../config/database.php';

echo "\n=======================================================\n";
echo "       FluencyHub Database Seeder & Initializer        \n";
echo "=======================================================\n";

$dbName = getenv('DB_NAME') ?: 'u120675969_fluencyextra';
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
echo "Connecting to [{$dbName}] on host [{$dbHost}]...\n\n";

try {
    // 1. Ensure schema and all required columns exist
    echo "[1/6] Verifying schema and table definitions...\n";
    $schemaFile = __DIR__ . '/schema.sql';
    if (file_exists($schemaFile)) {
        $sql = file_get_contents($schemaFile);
        $queries = array_filter(array_map('trim', explode(';', $sql)));
        foreach ($queries as $q) {
            if ($q !== '') {
                try {
                    $pdo->exec($q);
                } catch (Exception $e) {
                    // Ignore statement errors if tables already exist
                }
            }
        }
    }

    // Explicitly verify and add required columns to teacher_students
    $tsCols = $pdo->query("SHOW COLUMNS FROM teacher_students")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('email', $tsCols)) {
        $pdo->exec("ALTER TABLE teacher_students ADD COLUMN email VARCHAR(180) NULL UNIQUE");
    }
    if (!in_array('password', $tsCols)) {
        $pdo->exec("ALTER TABLE teacher_students ADD COLUMN password VARCHAR(255) NULL");
    }
    if (!in_array('password_hash', $tsCols)) {
        $pdo->exec("ALTER TABLE teacher_students ADD COLUMN password_hash VARCHAR(255) NULL");
    }
    if (!in_array('photo', $tsCols)) {
        $pdo->exec("ALTER TABLE teacher_students ADD COLUMN photo TEXT NULL");
    }

    // Ensure student_tokens table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS student_tokens (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        student_id INT UNSIGNED NOT NULL,
        token CHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_student_tokens_student FOREIGN KEY (student_id) REFERENCES teacher_students(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Ensure class_messages columns exist
    $cmCols = $pdo->query("SHOW COLUMNS FROM class_messages")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('is_broadcast', $cmCols)) {
        $pdo->exec("ALTER TABLE class_messages ADD COLUMN is_broadcast TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!in_array('broadcast_id', $cmCols)) {
        $pdo->exec("ALTER TABLE class_messages ADD COLUMN broadcast_id VARCHAR(64) NULL");
    }
    if (!in_array('recipient_student_id', $cmCols)) {
        $pdo->exec("ALTER TABLE class_messages ADD COLUMN recipient_student_id INT UNSIGNED NULL AFTER broadcast_id");
    }
    try {
        $pdo->exec("ALTER TABLE class_messages ADD INDEX idx_class_messages_recipient (recipient_student_id)");
    } catch (Throwable $e) {
        // Index already exists
    }
    echo "  ✓ Schema and table columns verified.\n";

    // 2. Seed Default Settings
    echo "[2/6] Seeding settings...\n";
    $pdo->exec("
        INSERT INTO settings (setting_key, setting_value)
        VALUES ('global_comments_enabled', '1')
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");
    echo "  ✓ Settings initialized.\n";

    // 3. Seed Admin Users
    echo "[3/6] Seeding admin accounts...\n";
    $adminPassword = 'Fluencyhubb@123';
    $adminHash = password_hash($adminPassword, PASSWORD_DEFAULT);

    $adminStmt = $pdo->prepare("
        INSERT INTO admin_users (name, email, password_hash)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)
    ");
    $adminStmt->execute(['Admin', 'fluencyhubb@gmail.com', $adminHash]);
    $adminStmt->execute(['Admin', 'admin@fluencyhubb.com', $adminHash]);
    echo "  ✓ Admin accounts seeded (fluencyhubb@gmail.com, admin@fluencyhubb.com).\n";

    // 4. Seed Default Teachers
    echo "[4/6] Seeding teachers...\n";
    $teachers = [
        [
            'name' => 'aaa',
            'email' => 'a@gmail.com',
            'phone' => '9988775544',
            'password' => 'Fluencyhubb@123',
            'role' => 'Teacher',
            'status' => 'Active',
            'qualification' => 'Master of Arts in English',
            'experience' => '5 Years',
            'specialization' => 'Spoken English & Communication',
            'languages' => 'English, Hindi',
            'teaching_mode' => 'Online'
        ],
        [
            'name' => 'Sarah Connor',
            'email' => 'sarah@fluencyhubb.com',
            'phone' => '9876543210',
            'password' => 'Fluencyhubb@123',
            'role' => 'Teacher',
            'status' => 'Active',
            'qualification' => 'TEFL Certified ESL Trainer',
            'experience' => '4 Years',
            'specialization' => 'Business English & Pronunciation',
            'languages' => 'English, Spanish',
            'teaching_mode' => 'Online'
        ]
    ];

    $teacherStmt = $pdo->prepare("
        INSERT INTO teachers (
            name, email, phone, password, role, status, 
            qualification, experience, specialization, languages, teaching_mode, created_by
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Admin'
        ) ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            phone = VALUES(phone),
            password = VALUES(password),
            status = VALUES(status),
            qualification = VALUES(qualification),
            experience = VALUES(experience),
            specialization = VALUES(specialization),
            teaching_mode = VALUES(teaching_mode)
    ");

    $teacherIds = [];
    foreach ($teachers as $t) {
        $check = $pdo->prepare("SELECT id FROM teachers WHERE email = ? LIMIT 1");
        $check->execute([$t['email']]);
        $existingId = $check->fetchColumn();

        if ($existingId) {
            $up = $pdo->prepare("
                UPDATE teachers SET 
                    name = ?, phone = ?, password = ?, role = ?, status = ?, 
                    qualification = ?, experience = ?, specialization = ?, languages = ?, teaching_mode = ? 
                WHERE id = ?
            ");
            $up->execute([
                $t['name'], $t['phone'], $t['password'], $t['role'], $t['status'],
                $t['qualification'], $t['experience'], $t['specialization'], $t['languages'], $t['teaching_mode'],
                $existingId
            ]);
            $teacherIds[$t['email']] = (int)$existingId;
        } else {
            $teacherStmt->execute([
                $t['name'], $t['email'], $t['phone'], $t['password'], $t['role'], $t['status'],
                $t['qualification'], $t['experience'], $t['specialization'], $t['languages'], $t['teaching_mode']
            ]);
            $teacherIds[$t['email']] = (int)$pdo->lastInsertId();
        }
    }
    echo "  ✓ Teachers seeded (aaa, Sarah Connor).\n";

    // 5. Seed Students Assigned to Teachers
    echo "[5/6] Seeding students with login credentials...\n";
    $students = [
        [
            'teacher_email' => 'a@gmail.com',
            'name' => 'ccc',
            'email' => 'c@gmail.com',
            'password' => 'Fluencyhubb@123',
            'course' => 'Spoken English Mastery',
            'duration' => 30,
            'class_type' => 'One-to-One',
            'package_classes' => 30,
            'completed_before_week' => 5,
            'this_week_classes' => 6,
            'rate' => 100.00,
            'status' => 'Active',
            'fee_status' => 'Paid',
            'total_fees_paid' => 4000.00,
            'remaining_fees' => 3000.00,
            'due_date' => '2026-09-10'
        ],
        [
            'teacher_email' => 'a@gmail.com',
            'name' => 'John Student',
            'email' => 'john.student@fluencyhubb.com',
            'password' => 'Student@123',
            'course' => 'English Fluency',
            'duration' => 30,
            'class_type' => 'One-to-One',
            'package_classes' => 20,
            'completed_before_week' => 4,
            'this_week_classes' => 2,
            'rate' => 120.00,
            'status' => 'Active',
            'fee_status' => 'Paid',
            'total_fees_paid' => 720.00,
            'remaining_fees' => 1680.00,
            'due_date' => '2026-09-20'
        ],
        [
            'teacher_email' => 'sarah@fluencyhubb.com',
            'name' => 'Alex Doe',
            'email' => 'alex.student@fluencyhubb.com',
            'password' => 'Student@123',
            'course' => 'IELTS Preparation',
            'duration' => 60,
            'class_type' => 'One-to-One',
            'package_classes' => 20,
            'completed_before_week' => 4,
            'this_week_classes' => 2,
            'rate' => 150.00,
            'status' => 'Active',
            'fee_status' => 'Paid',
            'total_fees_paid' => 1500.00,
            'remaining_fees' => 1500.00,
            'due_date' => '2026-09-25'
        ]
    ];

    foreach ($students as $s) {
        $tid = $teacherIds[$s['teacher_email']] ?? array_values($teacherIds)[0];
        $stuPassHash = password_hash($s['password'], PASSWORD_DEFAULT);

        $checkStu = $pdo->prepare("SELECT id FROM teacher_students WHERE email = ? LIMIT 1");
        $checkStu->execute([$s['email']]);
        $existingStuId = $checkStu->fetchColumn();

        if ($existingStuId) {
            $upStu = $pdo->prepare("
                UPDATE teacher_students SET 
                    teacher_id = ?, student_name = ?, password = ?, password_hash = ?, 
                    course_name = ?, class_duration = ?, class_type = ?, package_classes = ?, 
                    completed_before_week = ?, this_week_classes = ?, per_class_rate = ?, 
                    status = ?, fee_status = ?, total_fees_paid = ?, remaining_fees = ?, due_date = ? 
                WHERE id = ?
            ");
            $upStu->execute([
                $tid, $s['name'], $s['password'], $stuPassHash,
                $s['course'], $s['duration'], $s['class_type'], $s['package_classes'],
                $s['completed_before_week'], $s['this_week_classes'], $s['rate'],
                $s['status'], $s['fee_status'], $s['total_fees_paid'], $s['remaining_fees'], $s['due_date'],
                $existingStuId
            ]);
        } else {
            $insStu = $pdo->prepare("
                INSERT INTO teacher_students (
                    teacher_id, student_name, email, password, password_hash, 
                    course_name, class_duration, class_type, package_classes, 
                    completed_before_week, this_week_classes, per_class_rate, 
                    status, fee_status, total_fees_paid, remaining_fees, due_date
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            ");
            $insStu->execute([
                $tid, $s['name'], $s['email'], $s['password'], $stuPassHash,
                $s['course'], $s['duration'], $s['class_type'], $s['package_classes'],
                $s['completed_before_week'], $s['this_week_classes'], $s['rate'],
                $s['status'], $s['fee_status'], $s['total_fees_paid'], $s['remaining_fees'], $s['due_date']
            ]);
        }
    }
    echo "  ✓ Students seeded (ccc, John Student, Alex Doe).\n";

    // 6. Seed Sample Published Blogs
    echo "[6/6] Seeding sample published blogs...\n";
    $blogs = [
        [
            'title' => 'Top 10 Daily Habits to Master English Fluency Fast',
            'short_description' => 'Discover 10 proven daily practices that build language confidence, expand vocabulary, and accelerate English speaking fluency.',
            'content' => '<p>Mastering any language requires consistent, meaningful practice. Here are the top 10 daily habits to transform your English speaking skills:</p><ol><li><strong>Think in English:</strong> Narrate your daily thoughts directly in English without translating from your native language.</li><li><strong>Read Aloud for 15 Minutes:</strong> Reading aloud exercises your vocal muscles and reinforces natural pronunciation rhythm.</li><li><strong>Listen to Podcasts & Audiobooks:</strong> Immerse yourself in authentic conversations and accents every day during your commute.</li><li><strong>Shadow Native Speakers:</strong> Repeat sentences immediately after hearing them to match intonation and cadence.</li><li><strong>Record Your Own Voice:</strong> Listen back to identify pronunciation patterns and celebrate noticeable progress over time.</li><li><strong>Learn Words in Context:</strong> Avoid memorizing isolated word lists; learn complete phrases and collocations.</li><li><strong>Engage with Live Mentors:</strong> Dedicated 1-on-1 speaking sessions provide real-time corrections and customized feedback.</li><li><strong>Write Daily Reflections:</strong> Summarize your day in 5 bullet points to strengthen sentence construction.</li><li><strong>Embrace Mistakes Boldly:</strong> Errors are milestones of active learning; every conversation makes you more articulate.</li><li><strong>Stay Patient & Consistent:</strong> Daily 20-minute practice is far more impactful than hours once a week.</li></ol>',
            'category' => 'Learning Tips',
            'author' => 'Admin',
            'publish_date' => '2026-09-01'
        ],
        [
            'title' => 'How to Confidently Ace Your Next Job Interview in English',
            'short_description' => 'Essential strategies, key phrases, and mindset techniques to communicate effectively and impress global recruiters.',
            'content' => '<p>Interviewing in a second language can feel daunting, but with structured preparation, you can articulate your achievements with clarity and authority.</p><h3>Key Strategies:</h3><ul><li><strong>Use the STAR Method:</strong> Frame your answers around Situation, Task, Action, and Result.</li><li><strong>Master Professional Transitions:</strong> Use transition words such as <em>"Furthermore," "Consequently,"</em> and <em>"In my experience."</em></li><li><strong>Ask Clarifying Questions Confidently:</strong> If you miss a question, calmly say: <em>"Could you please elaborate on that point?"</em></li></ul><p>FluencyHub mentors conduct targeted mock interview simulations tailored to your industry to ensure you speak with poise.</p>',
            'category' => 'Career Guidance',
            'author' => 'Admin',
            'publish_date' => '2026-09-03'
        ],
        [
            'title' => 'The Impact of Personalized 1-on-1 Mentorship in Language Learning',
            'short_description' => 'Why personalized instruction outpaces traditional classroom environments when developing fluent communication skills.',
            'content' => '<p>Every learner possesses a unique linguistic background, learning pace, and personal objective. Traditional group classrooms often move at an average speed, leaving individualized pronunciation hurdles and conversational hesitations unaddressed.</p><p>With 1-on-1 personalized mentorship at FluencyHub, your instructor concentrates 100% of class time on your conversational fluency, correcting nuances immediately and building lifelong confidence.</p>',
            'category' => 'Educational Content',
            'author' => 'Admin',
            'publish_date' => '2026-09-05'
        ]
    ];

    $blogStmt = $pdo->prepare("
        INSERT INTO blogs (title, short_description, content, category, author, publish_date, comments_enabled, status)
        VALUES (?, ?, ?, ?, ?, ?, 1, 'published')
    ");
    foreach ($blogs as $b) {
        $checkBlog = $pdo->prepare("SELECT id FROM blogs WHERE title = ? LIMIT 1");
        $checkBlog->execute([$b['title']]);
        if (!$checkBlog->fetchColumn()) {
            $blogStmt->execute([
                $b['title'], $b['short_description'], $b['content'],
                $b['category'], $b['author'], $b['publish_date']
            ]);
        }
    }
    echo "  ✓ Sample blog posts seeded.\n";

    // 7. Seed Broadcast Welcome Announcement
    $bcCheck = $pdo->query("SELECT COUNT(*) FROM class_messages WHERE is_broadcast = 1")->fetchColumn();
    if ($bcCheck == 0 && !empty($teacherIds)) {
        $bcId = 'bc_welcome_' . bin2hex(random_bytes(8));
        $now = date('Y-m-d H:i:s');
        $bcStmt = $pdo->prepare("
            INSERT INTO class_messages 
                (teacher_id, sender_role, sender_id, content, is_broadcast, broadcast_id, created_at) 
            VALUES 
                (?, 'admin', 1, '📢 Welcome to FluencyHub! We are thrilled to support your language learning and teaching journey. Please reach out anytime via class chat.', 1, ?, ?)
        ");
        foreach ($teacherIds as $tid) {
            $bcStmt->execute([(int)$tid, $bcId, $now]);
        }
        echo "  ✓ Initial broadcast welcome announcement seeded.\n";
    }

    echo "\n=======================================================\n";
    echo "                 SEEDING SUCCESSFUL!                   \n";
    echo "=======================================================\n";
    echo "Default Credentials:\n";
    echo "-------------------------------------------------------\n";
    echo "ADMIN LOGIN (/admin/login):\n";
    echo "  Email:    fluencyhubb@gmail.com (or admin@fluencyhubb.com)\n";
    echo "  Password: Fluencyhubb@123\n\n";
    echo "TEACHER LOGIN (/login -> Teacher tab):\n";
    echo "  Email:    a@gmail.com\n";
    echo "  Password: Fluencyhubb@123\n\n";
    echo "  Email:    sarah@fluencyhubb.com\n";
    echo "  Password: Fluencyhubb@123\n\n";
    echo "STUDENT LOGIN (/login -> Student tab):\n";
    echo "  Email:    c@gmail.com\n";
    echo "  Password: Fluencyhubb@123\n\n";
    echo "  Email:    john.student@fluencyhubb.com\n";
    echo "  Password: Student@123\n\n";
    echo "  Email:    alex.student@fluencyhubb.com\n";
    echo "  Password: Student@123\n";
    echo "=======================================================\n\n";

} catch (Exception $e) {
    echo "\n[ERROR] Seeding failed: " . $e->getMessage() . "\n";
    exit(1);
}
