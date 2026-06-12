-- Seed data (mirrors InMemoryGradebookRepository seed)

-- Password hashes (bcrypt with cost 10):
-- Generated: node -e "console.log(require('bcryptjs').hashSync('Student123$', 10))"
-- Generated: node -e "console.log(require('bcryptjs').hashSync('Login123$', 10))"

INSERT INTO users (id, role, full_name, password_hash, last_name, birth_date, group_id, email, student_id)
VALUES
  (1, 'STUDENT', 'Вольфович Арсений', '$2b$10$8CJn4Tl6XgcuxGFd5KVCAOBZi40lsszDtbZO12pym5wbGpxCNw66a', 'Вольфович', '2007-11-08', 'group-1', NULL, 'student-001'),
  (2, 'TEACHER', 'Вольфович Александр', '$2b$10$7ThUzqWiSCleOCqr.WCqQeZL4DPOxlGN6w.hsbdyeu/LqT4AMy9bW', 'Вольфович', NULL, NULL, 'teacher@mail.com', NULL)
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO groups_info (id, name)
VALUES
  ('group-1', 'Т-394'),
  ('group-2', 'Т-395')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, name)
VALUES
  ('course-001', 'Веб-программирование'),
  ('course-002', 'Системы управления БД'),
  ('course-003', 'Компьютерные сети'),
  ('course-004', 'Тестирование ПО')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, name, group_name)
VALUES
  ('student-001', 'Вольфович Арсений', 'Т-394'),
  ('student-002', 'Иванов Иван', 'Т-394'),
  ('student-003', 'Петров Петр', 'Т-394'),
  ('student-004', 'Сидорова Анна', 'Т-395')
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, name, teacher_name)
VALUES
  ('course-001', 'Веб-программирование', 'Вольфович Александр'),
  ('course-002', 'Системы управления БД', 'Преп. Сидоров'),
  ('course-003', 'Компьютерные сети', 'Преп. Петров'),
  ('course-004', 'Тестирование ПО', 'Преп. Иванова')
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_schedule (course_id, day, time, room)
VALUES
  ('course-001', 'Понедельник', '09:00-10:30', 'Ауд. 214'),
  ('course-001', 'Среда', '11:00-12:30', 'Ауд. 214'),
  ('course-002', 'Вторник', '10:00-11:30', 'Ауд. 305'),
  ('course-003', 'Четверг', '09:00-10:30', 'Ауд. 401'),
  ('course-004', 'Пятница', '14:00-15:20', 'Ауд. 219');

INSERT INTO student_courses (student_id, course_id)
VALUES
  ('student-001', 'course-001'),
  ('student-001', 'course-002'),
  ('student-002', 'course-001');

INSERT INTO grades (student_id, subject_id, value, type, date)
VALUES
  ('student-001', 'course-001', 8, 'lab', '2026-05-15'),
  ('student-001', 'course-001', 9, 'test', '2026-05-20'),
  ('student-001', 'course-002', 8, 'exam', '2026-05-18');

INSERT INTO attendance (student_id, subject_id, date, status)
VALUES
  ('student-001', 'course-001', '2026-05-12', 'PRESENT'),
  ('student-001', 'course-001', '2026-05-19', 'LATE'),
  ('student-001', 'course-002', '2026-05-13', 'ABSENT');

INSERT INTO labs (id, subject_id, title, issue_date, due_date, team_work, theory_materials)
VALUES
  ('lab-001', 'course-001', 'Лабораторная работа 1', '2026-05-01', '2026-05-10', FALSE, 'Теоретические материалы по линейной алгебре'),
  ('lab-002', 'course-002', 'Лабораторная работа 2', '2026-05-05', '2026-05-14', TRUE, 'Теория электростатики')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab_partners (lab_id, student_id, name)
VALUES
  ('lab-002', 'student-002', 'Пётр Петров');

INSERT INTO lab_submissions (lab_id, student_id, submission_date, file_url, teacher_comment, teacher_grade, status)
VALUES
  ('lab-001', 'student-001', '2026-05-09', '/files/lab-001-solution.pdf', 'Хорошая работа, нужны исправления по пункту 3', 8, 'graded'),
  ('lab-002', 'student-001', '2026-05-13', '/files/lab-002-solution.pdf', 'Ждём отчёт о работе команды', NULL, 'submitted');

INSERT INTO teacher_students (id, full_name, group_id, is_expelled, is_new)
VALUES
  ('student-001', 'Вольфович Арсений', 'group-1', FALSE, FALSE),
  ('student-002', 'Иванов Иван', 'group-1', FALSE, TRUE),
  ('student-003', 'Петров Петр', 'group-1', TRUE, FALSE),
  ('student-004', 'Сидорова Анна', 'group-2', FALSE, FALSE);

INSERT INTO teacher_groups (teacher_id, group_id, subject_id)
VALUES
  (2, 'group-1', 'course-001'),
  (2, 'group-1', 'course-002'),
  (2, 'group-2', 'course-001');

INSERT INTO lessons (id, subject_id, group_id, date, start_time, end_time)
VALUES
  ('lesson-1', 'course-001', 'group-1', '2026-06-01', '09:00', '10:30'),
  ('lesson-2', 'course-001', 'group-1', '2026-06-08', '09:00', '10:30'),
  ('lesson-3', 'course-002', 'group-1', '2026-06-08', '11:00', '12:30');

INSERT INTO teacher_grades (student_id, lesson_id, value, type)
VALUES
  ('student-001', 'lesson-1', 5, 'PRACTICAL'),
  ('student-002', 'lesson-1', 4, 'PRACTICAL');

INSERT INTO teacher_attendance (student_id, lesson_id, status)
VALUES
  ('student-001', 'lesson-1', 'PRESENT'),
  ('student-002', 'lesson-1', 'LATE'),
  ('student-003', 'lesson-1', 'ABSENT');

INSERT INTO programs (id, subject_id, title, type, deadline, description, file_url)
VALUES
  ('program-1', 'course-001', 'Лабораторная работа №1', 'LAB', '2026-06-15', 'React Router и API', NULL),
  ('program-2', 'course-001', 'Контрольная работа', 'CONTROL', '2026-06-20', 'Итоговая контрольная', NULL),
  ('program-3', 'course-002', 'Лабораторная работа по БД', 'LAB', '2026-06-18', 'SQL запросы', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO teacher_lab_submissions (id, student_id, student_name, program_id, program_title, file_url, comment, grade, status, submitted_at)
VALUES
  ('submission-1', 'student-001', 'Вольфович Арсений', 'program-1', 'Лабораторная работа №1', '/uploads/lab1.pdf', 'Хорошая работа', 5, 'graded', '2026-06-10'),
  ('submission-2', 'student-002', 'Иванов Иван', 'program-1', 'Лабораторная работа №1', '/uploads/lab1_ivanov.pdf', NULL, NULL, 'submitted', '2026-06-12')
ON CONFLICT (id) DO NOTHING;
