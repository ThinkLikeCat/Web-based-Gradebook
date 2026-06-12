-- Migrate legacy grades/attendance to unified teacher_grades/teacher_attendance
-- Creates missing lessons for each unique subject+date+group combination

DO $$
DECLARE
  g RECORD;
  lid VARCHAR;
  gid VARCHAR;
BEGIN
  FOR g IN SELECT DISTINCT g2.student_id, g2.subject_id, g2.date FROM grades g2 LOOP
    SELECT ts.group_id INTO gid FROM teacher_students ts WHERE ts.id = g.student_id LIMIT 1;
    IF gid IS NULL THEN CONTINUE; END IF;

    SELECT l.id INTO lid FROM lessons l WHERE l.subject_id = g.subject_id AND l.date = g.date AND l.group_id = gid LIMIT 1;
    IF lid IS NULL THEN
      lid := 'migrated-' || g.subject_id || '-' || g.date || '-' || gid;
      INSERT INTO lessons (id, subject_id, group_id, date, start_time, end_time)
      VALUES (lid, g.subject_id, gid, g.date, '00:00', '00:00');
    END IF;

    INSERT INTO teacher_grades (student_id, lesson_id, value, type)
    SELECT g3.student_id, lid, g3.value, g3.type
    FROM grades g3 WHERE g3.student_id = g.student_id AND g3.subject_id = g.subject_id AND g3.date = g.date
    ON CONFLICT (student_id, lesson_id) DO NOTHING;
  END LOOP;
END $$;

DO $$
DECLARE
  a RECORD;
  lid VARCHAR;
  gid VARCHAR;
BEGIN
  FOR a IN SELECT DISTINCT a2.student_id, a2.subject_id, a2.date FROM attendance a2 LOOP
    SELECT ts.group_id INTO gid FROM teacher_students ts WHERE ts.id = a.student_id LIMIT 1;
    IF gid IS NULL THEN CONTINUE; END IF;

    SELECT l.id INTO lid FROM lessons l WHERE l.subject_id = a.subject_id AND l.date = a.date AND l.group_id = gid LIMIT 1;
    IF lid IS NULL THEN
      lid := 'migrated-' || a.subject_id || '-' || a.date || '-' || gid;
      INSERT INTO lessons (id, subject_id, group_id, date, start_time, end_time)
      VALUES (lid, a.subject_id, gid, a.date, '00:00', '00:00');
    END IF;

    INSERT INTO teacher_attendance (student_id, lesson_id, status)
    SELECT a3.student_id, lid, a3.status
    FROM attendance a3 WHERE a3.student_id = a.student_id AND a3.subject_id = a.subject_id AND a3.date = a.date
    ON CONFLICT (student_id, lesson_id) DO NOTHING;
  END LOOP;
END $$;
