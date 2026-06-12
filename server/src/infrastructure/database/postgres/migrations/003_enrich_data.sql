-- Enriched seed data: additional students, courses, grades, labs, submissions

-- Ensure password hashes are real (overwrites dummy hashes from 002)
UPDATE users SET password_hash = '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a' WHERE id = 1;
UPDATE users SET password_hash = '$2b$10$7ThUzqWiSCleOCqr.WCqQeZL4DPOxlGN6w.hsbdyeu/LqT4AMy9bW' WHERE id = 2;

-- Additional users (students)
INSERT INTO users (id, role, full_name, password_hash, last_name, birth_date, group_id, email, student_id)
VALUES
  (3, 'STUDENT', 'Иванов Иван', '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a', 'Иванов', '2006-05-15', 'group-1', NULL, 'student-002'),
  (4, 'STUDENT', 'Петров Петр', '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a', 'Петров', '2006-08-22', 'group-1', NULL, 'student-003'),
  (5, 'STUDENT', 'Сидорова Анна', '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a', 'Сидорова', '2007-01-30', 'group-2', NULL, 'student-004'),
  (6, 'STUDENT', 'Кузнецов Алексей', '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a', 'Кузнецов', '2006-11-12', 'group-2', NULL, 'student-005'),
  (7, 'STUDENT', 'Смирнова Ольга', '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a', 'Смирнова', '2007-03-18', 'group-1', NULL, 'student-006'),
  (8, 'STUDENT', 'Федоров Дмитрий', '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a', 'Федоров', '2006-07-05', 'group-2', NULL, 'student-007'),
  (9, 'STUDENT', 'Морозова Елена', '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a', 'Морозова', '2007-09-25', 'group-1', NULL, 'student-008')
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Additional students
INSERT INTO students (id, name, group_name)
VALUES
  ('student-005', 'Кузнецов Алексей', 'Т-395'),
  ('student-006', 'Смирнова Ольга', 'Т-394'),
  ('student-007', 'Федоров Дмитрий', 'Т-395'),
  ('student-008', 'Морозова Елена', 'Т-394')
ON CONFLICT (id) DO NOTHING;

-- Additional subjects
INSERT INTO subjects (id, name)
VALUES
  ('course-005', 'Базы данных'),
  ('course-006', 'Алгоритмы и структуры данных')
ON CONFLICT (id) DO NOTHING;

-- Additional courses
INSERT INTO courses (id, name, teacher_name)
VALUES
  ('course-005', 'Базы данных', 'Преп. Сидоров'),
  ('course-006', 'Алгоритмы и структуры данных', 'Преп. Петров')
ON CONFLICT (id) DO NOTHING;

-- Additional course_schedule
INSERT INTO course_schedule (course_id, day, time, room)
VALUES
  ('course-005', 'Вторник', '14:00-15:30', 'Ауд. 310'),
  ('course-005', 'Четверг', '11:00-12:30', 'Ауд. 310'),
  ('course-006', 'Понедельник', '14:00-15:30', 'Ауд. 405')
ON CONFLICT DO NOTHING;

-- Update course-002 teacher to match InMemory
UPDATE courses SET teacher_name = 'Вольфович Александр' WHERE id = 'course-002';

-- Additional student_courses
INSERT INTO student_courses (student_id, course_id)
VALUES
  ('student-001', 'course-003'),
  ('student-002', 'course-003'),
  ('student-003', 'course-004'),
  ('student-004', 'course-002'),
  ('student-004', 'course-004'),
  ('student-005', 'course-002'),
  ('student-005', 'course-003'),
  ('student-006', 'course-001'),
  ('student-006', 'course-004'),
  ('student-007', 'course-002'),
  ('student-008', 'course-001'),
  ('student-008', 'course-004')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Additional grades
INSERT INTO grades (student_id, subject_id, value, type, date)
VALUES
  ('student-001', 'course-001', 7, 'lab', '2026-05-22'),
  ('student-001', 'course-003', 6, 'lab', '2026-05-25'),
  ('student-002', 'course-001', 4, 'lab', '2026-05-15'),
  ('student-002', 'course-001', 5, 'test', '2026-05-20'),
  ('student-002', 'course-003', 3, 'lab', '2026-05-25'),
  ('student-003', 'course-001', 9, 'lab', '2026-05-15'),
  ('student-003', 'course-001', 10, 'test', '2026-05-20'),
  ('student-003', 'course-004', 8, 'lab', '2026-05-26'),
  ('student-004', 'course-002', 5, 'exam', '2026-05-18'),
  ('student-004', 'course-004', 6, 'lab', '2026-05-26'),
  ('student-005', 'course-002', 7, 'lab', '2026-05-19'),
  ('student-005', 'course-003', 4, 'lab', '2026-05-27'),
  ('student-006', 'course-001', 8, 'lab', '2026-05-15'),
  ('student-006', 'course-001', 9, 'test', '2026-05-20'),
  ('student-006', 'course-004', 10, 'lab', '2026-05-26'),
  ('student-007', 'course-002', 3, 'lab', '2026-05-19'),
  ('student-008', 'course-001', 6, 'lab', '2026-05-15'),
  ('student-008', 'course-004', 5, 'lab', '2026-05-26');

-- Additional attendance
INSERT INTO attendance (student_id, subject_id, date, status)
VALUES
  ('student-001', 'course-003', '2026-05-20', 'PRESENT'),
  ('student-002', 'course-001', '2026-05-12', 'PRESENT'),
  ('student-002', 'course-003', '2026-05-20', 'ABSENT'),
  ('student-003', 'course-001', '2026-05-12', 'LATE'),
  ('student-003', 'course-004', '2026-05-21', 'PRESENT'),
  ('student-004', 'course-002', '2026-05-13', 'PRESENT'),
  ('student-004', 'course-004', '2026-05-21', 'ABSENT'),
  ('student-005', 'course-002', '2026-05-13', 'PRESENT'),
  ('student-006', 'course-001', '2026-05-19', 'PRESENT'),
  ('student-006', 'course-004', '2026-05-21', 'LATE'),
  ('student-007', 'course-002', '2026-05-13', 'ABSENT'),
  ('student-008', 'course-001', '2026-05-12', 'PRESENT');

-- Additional labs
INSERT INTO labs (id, subject_id, title, issue_date, due_date, team_work, theory_materials)
VALUES
  ('lab-003', 'course-001', 'Лабораторная работа 2: API', '2026-05-15', '2026-05-25', FALSE, 'Работа с REST API и хуками'),
  ('lab-004', 'course-002', 'Лабораторная работа: SQL', '2026-05-05', '2026-05-14', TRUE, 'SQL запросы, JOIN, агрегация'),
  ('lab-005', 'course-003', 'Лабораторная работа: Сети', '2026-05-10', '2026-05-20', FALSE, 'Настройка TCP/IP, маршрутизация'),
  ('lab-006', 'course-005', 'Лабораторная работа: PostgreSQL', '2026-05-12', '2026-05-22', TRUE, 'Нормализация, индексы, транзакции')
ON CONFLICT (id) DO NOTHING;

-- Additional lab_partners
INSERT INTO lab_partners (lab_id, student_id, name)
VALUES
  ('lab-004', 'student-002', 'Иванов Иван'),
  ('lab-004', 'student-005', 'Кузнецов Алексей'),
  ('lab-006', 'student-004', 'Сидорова Анна');

-- Additional lab_submissions
INSERT INTO lab_submissions (lab_id, student_id, submission_date, file_url, teacher_comment, teacher_grade, status)
VALUES
  ('lab-001', 'student-002', '2026-05-10', '/files/lab-001-ivanov.pdf', '', 7, 'graded'),
  ('lab-001', 'student-003', '2026-05-08', '/files/lab-001-petrov.pdf', 'Отлично!', 10, 'graded'),
  ('lab-002', 'student-001', '2026-05-23', '/files/lab-002-solution.pdf', '', NULL, 'submitted'),
  ('lab-004', 'student-002', '2026-05-13', '/files/lab-003-ivanov.pdf', '', NULL, 'submitted'),
  ('lab-005', 'student-001', '2026-05-18', '/files/lab-004-solution.pdf', 'Есть ошибки в конфигурации', 7, 'graded'),
  ('lab-006', 'student-004', '2026-05-20', '/files/lab-005-sidorova.pdf', 'Хорошая работа', 8, 'graded');

-- Additional teacher_students
INSERT INTO teacher_students (id, full_name, group_id, is_expelled, is_new)
VALUES
  ('student-005', 'Кузнецов Алексей', 'group-2', FALSE, FALSE),
  ('student-006', 'Смирнова Ольга', 'group-1', FALSE, TRUE),
  ('student-007', 'Федоров Дмитрий', 'group-2', FALSE, FALSE),
  ('student-008', 'Морозова Елена', 'group-1', FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Additional teacher_groups
INSERT INTO teacher_groups (teacher_id, group_id, subject_id)
VALUES
  (2, 'group-2', 'course-002')
ON CONFLICT DO NOTHING;

-- Additional lessons
INSERT INTO lessons (id, subject_id, group_id, date, start_time, end_time)
VALUES
  ('lesson-4', 'course-001', 'group-2', '2026-06-02', '09:00', '10:30'),
  ('lesson-5', 'course-002', 'group-2', '2026-06-09', '11:00', '12:30'),
  ('lesson-6', 'course-003', 'group-1', '2026-06-03', '14:00', '15:30'),
  ('lesson-7', 'course-004', 'group-1', '2026-06-04', '10:00', '11:30')
ON CONFLICT (id) DO NOTHING;

-- Additional teacher_grades
INSERT INTO teacher_grades (student_id, lesson_id, value, type)
VALUES
  ('student-003', 'lesson-1', 5, 'PRACTICAL'),
  ('student-006', 'lesson-1', 4, 'PRACTICAL'),
  ('student-008', 'lesson-1', 3, 'PRACTICAL'),
  ('student-001', 'lesson-2', 5, 'THEORY'),
  ('student-002', 'lesson-2', 3, 'THEORY'),
  ('student-004', 'lesson-4', 4, 'PRACTICAL'),
  ('student-005', 'lesson-4', 5, 'PRACTICAL'),
  ('student-007', 'lesson-4', 2, 'PRACTICAL')
ON CONFLICT (student_id, lesson_id) DO NOTHING;

-- Additional teacher_attendance
INSERT INTO teacher_attendance (student_id, lesson_id, status)
VALUES
  ('student-006', 'lesson-1', 'PRESENT'),
  ('student-008', 'lesson-1', 'PRESENT'),
  ('student-001', 'lesson-2', 'PRESENT'),
  ('student-002', 'lesson-2', 'ABSENT'),
  ('student-004', 'lesson-4', 'PRESENT'),
  ('student-005', 'lesson-4', 'LATE'),
  ('student-007', 'lesson-4', 'PRESENT')
ON CONFLICT (student_id, lesson_id) DO NOTHING;

-- Additional programs
INSERT INTO programs (id, subject_id, title, type, deadline, description, file_url)
VALUES
  ('program-4', 'course-001', 'Лабораторная работа №2: Маршрутизация', 'LAB', '2026-06-25', 'React Router, защищённые маршруты', NULL),
  ('program-5', 'course-003', 'Курсовая работа по сетям', 'LAB', '2026-06-28', 'Проектирование локальной сети', NULL)
ON CONFLICT (id) DO NOTHING;

-- Update program titles
UPDATE programs SET title = 'Лабораторная работа №1: React' WHERE id = 'program-1';
UPDATE programs SET description = 'Компоненты, состояние, формы' WHERE id = 'program-2';
UPDATE programs SET description = 'SQL запросы, JOIN, подзапросы' WHERE id = 'program-3';

-- Additional teacher_lab_submissions
INSERT INTO teacher_lab_submissions (id, student_id, student_name, program_id, program_title, file_url, comment, grade, status, submitted_at)
VALUES
  ('submission-3', 'student-006', 'Смирнова Ольга', 'program-1', 'Лабораторная работа №1: React', '/uploads/lab1_smirnova.pdf', 'Нужно доработать', 3, 'graded', '2026-06-11'),
  ('submission-4', 'student-001', 'Вольфович Арсений', 'program-4', 'Лабораторная работа №2: Маршрутизация', '/uploads/lab4.pdf', NULL, NULL, 'submitted', '2026-06-20'),
  ('submission-5', 'student-003', 'Петров Петр', 'program-1', 'Лабораторная работа №1: React', '/uploads/lab1_petrov.pdf', 'Не загружен файл', NULL, 'submitted', '2026-06-14')
ON CONFLICT (id) DO NOTHING;

-- Update program titles for submissions
UPDATE teacher_lab_submissions SET program_title = 'Лабораторная работа №1: React' WHERE program_id = 'program-1';
