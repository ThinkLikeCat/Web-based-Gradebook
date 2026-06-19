-- Gradebook Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  birth_date VARCHAR(20),
  group_id VARCHAR(50),
  email VARCHAR(255),
  student_id VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS sessions (
  refresh_token VARCHAR(255) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS groups_info (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  group_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS course_schedule (
  id SERIAL PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  time VARCHAR(20) NOT NULL,
  room VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS student_courses (
  student_id VARCHAR(100) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL,
  subject_id VARCHAR(50) NOT NULL,
  value INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  date VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL,
  subject_id VARCHAR(50) NOT NULL,
  date VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS labs (
  id VARCHAR(50) PRIMARY KEY,
  subject_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  issue_date VARCHAR(20) NOT NULL,
  due_date VARCHAR(20) NOT NULL,
  team_work BOOLEAN NOT NULL DEFAULT FALSE,
  theory_materials TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS lab_partners (
  id SERIAL PRIMARY KEY,
  lab_id VARCHAR(50) NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  student_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_submissions (
  id SERIAL PRIMARY KEY,
  lab_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  submission_date VARCHAR(20) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  teacher_comment TEXT NOT NULL DEFAULT '',
  teacher_grade INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted'
);

CREATE TABLE IF NOT EXISTS teacher_students (
  id VARCHAR(100) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  group_id VARCHAR(50) NOT NULL,
  is_expelled BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS teacher_groups (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id VARCHAR(50) NOT NULL,
  subject_id VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR(50) PRIMARY KEY,
  subject_id VARCHAR(50) NOT NULL,
  group_id VARCHAR(50) NOT NULL,
  date VARCHAR(20) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_grades (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL,
  lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  UNIQUE (student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS teacher_attendance (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL,
  lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  UNIQUE (student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS programs (
  id VARCHAR(50) PRIMARY KEY,
  subject_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  deadline VARCHAR(20),
  description TEXT,
  file_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS teacher_lab_submissions (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(100) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  program_id VARCHAR(50) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  program_title VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL DEFAULT '',
  comment TEXT,
  grade INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',
  submitted_at VARCHAR(20) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_groups_teacher ON teacher_groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_group_subject ON lessons(group_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_grades_lesson ON teacher_grades(lesson_id);
CREATE INDEX IF NOT EXISTS idx_teacher_attendance_lesson ON teacher_attendance(lesson_id);
CREATE INDEX IF NOT EXISTS idx_programs_subject ON programs(subject_id);
CREATE INDEX IF NOT EXISTS idx_lab_submissions_lab ON teacher_lab_submissions(program_id);
