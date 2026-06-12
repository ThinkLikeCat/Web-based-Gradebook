-- Additional teachers for testing (minimum 3 teachers total)
-- Passwords generated with bcrypt cost 10

-- Teachers:
--   Иванова Мария  – Teacher456$  – Компьютерные сети (group-1)
--   Петров Сергей  – Teacher789$  – Тестирование ПО (group-2)

INSERT INTO users (id, role, full_name, password_hash, last_name, birth_date, group_id, email, student_id)
VALUES
  (10, 'TEACHER', 'Иванова Мария', '$2b$10$e8EGo.WoCSEtfzlUgkNVp.Q9B9a6alaayrKaVde94e4vGNxMT03xW', 'Иванова', NULL, NULL, 'maria@mail.com', NULL),
  (11, 'TEACHER', 'Петров Сергей', '$2b$10$9U4OLN1vhzJejoaYQebuLesMoA10Uwfj8aoc1gMPG8yHZQHoVWuUG', 'Петров', NULL, NULL, 'sergey@mail.com', NULL)
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO teacher_groups (teacher_id, group_id, subject_id)
VALUES
  (10, 'group-1', 'course-003'),
  (11, 'group-2', 'course-004')
ON CONFLICT DO NOTHING;
