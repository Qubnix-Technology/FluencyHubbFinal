CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_tokens_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blogs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  short_description TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  author VARCHAR(120) NOT NULL,
  publish_date DATE NOT NULL,
  image_url TEXT,
  image_file_url TEXT,
  video_url TEXT,
  video_file_url TEXT,
  tags TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  whatsapp_number VARCHAR(40),
  comments_enabled TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blogs_category (category),
  INDEX idx_blogs_status_date (status, publish_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS enquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(180) NOT NULL,
  country VARCHAR(120) NOT NULL,
  age VARCHAR(60),
  profession VARCHAR(120),
  mobile VARCHAR(40) NOT NULL,
  email VARCHAR(180) NOT NULL,
  school VARCHAR(180) NOT NULL,
  courses TEXT NOT NULL,
  learning_format VARCHAR(120),
  timing VARCHAR(120),
  message TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_enquiries_created (created_at),
  INDEX idx_enquiries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  blog_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  comment TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  INDEX idx_comments_blog_status (blog_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO settings (setting_key, setting_value)
VALUES ('global_comments_enabled', '1')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

CREATE TABLE IF NOT EXISTS teachers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(180),
  phone VARCHAR(60),
  password VARCHAR(255),
  role VARCHAR(60) NOT NULL DEFAULT 'Teacher',
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  photo TEXT,
  gender VARCHAR(60),
  dob DATE NULL,
  address TEXT,
  city VARCHAR(120),
  country VARCHAR(120),
  employee_id VARCHAR(80),
  joining_date DATE NULL,
  qualification VARCHAR(180),
  experience VARCHAR(120),
  specialization VARCHAR(180),
  languages VARCHAR(255),
  teaching_mode VARCHAR(80) NOT NULL DEFAULT 'Online',
  last_login DATETIME NULL,
  created_by VARCHAR(120) DEFAULT 'Admin',
  created_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS teacher_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT UNSIGNED NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_teacher_tokens_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS teacher_students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT UNSIGNED NOT NULL,
  student_name VARCHAR(180) NOT NULL,
  course_name VARCHAR(180) NOT NULL,
  class_duration INT UNSIGNED NOT NULL DEFAULT 30,
  class_type ENUM('One-to-One', 'Group') NOT NULL DEFAULT 'One-to-One',
  package_classes INT UNSIGNED NOT NULL DEFAULT 20,
  completed_before_week INT UNSIGNED NOT NULL DEFAULT 0,
  this_week_classes INT UNSIGNED NOT NULL DEFAULT 0,
  per_class_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('Active', 'Completed', 'On Hold') NOT NULL DEFAULT 'Active',
  fee_status VARCHAR(80),
  total_fees_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
  due_date DATE NULL,
  internal_notes TEXT,
  payment_followup_status VARCHAR(160),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_teacher_students_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_teacher_students_teacher (teacher_id),
  INDEX idx_teacher_students_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE teacher_students ADD COLUMN IF NOT EXISTS email VARCHAR(180) NULL;
ALTER TABLE teacher_students ADD INDEX idx_teacher_students_email (email);
ALTER TABLE teacher_students ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL;
ALTER TABLE teacher_students ADD COLUMN IF NOT EXISTS photo TEXT NULL;

CREATE TABLE IF NOT EXISTS student_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_tokens_student FOREIGN KEY (student_id) REFERENCES teacher_students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_role ENUM('admin','teacher','student') NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  receiver_role ENUM('admin','teacher','student') NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  read_at DATETIME NULL,
  deleted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_conversation (sender_role, sender_id, receiver_role, receiver_id, created_at),
  INDEX idx_messages_unread (receiver_role, receiver_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shared class discussion. A teacher, their assigned students, and administrators can participate.
CREATE TABLE IF NOT EXISTS class_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT UNSIGNED NOT NULL,
  sender_role ENUM('admin','teacher','student') NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  deleted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_class_messages_thread (teacher_id, created_at, id),
  CONSTRAINT fk_class_messages_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
