import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { TeacherJournalRepository, TeacherLessonData, TeacherGradeData, TeacherAttendanceData, CreateLessonData, SaveGradeData, SaveAttendanceData, CourseScheduleItem } from '../../../../domain/repositories/TeacherJournalRepository';

export class PostgresTeacherJournalRepository implements TeacherJournalRepository {
  constructor(private readonly pool: Pool) {}

  async findLessonsByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherLessonData[]> {
    const result = await this.pool.query(
      'SELECT id, subject_id, group_id, date, start_time, end_time FROM lessons WHERE group_id = $1 AND subject_id = $2 ORDER BY date, start_time',
      [groupId, subjectId],
    );
    return result.rows.map(r => ({
      id: r.id,
      subjectId: r.subject_id,
      groupId: r.group_id,
      date: r.date,
      startTime: r.start_time,
      endTime: r.end_time,
    }));
  }

  async findLessonById(lessonId: string): Promise<TeacherLessonData | null> {
    const result = await this.pool.query(
      'SELECT id, subject_id, group_id, date, start_time, end_time FROM lessons WHERE id = $1',
      [lessonId],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return { id: r.id, subjectId: r.subject_id, groupId: r.group_id, date: r.date, startTime: r.start_time, endTime: r.end_time };
  }

  async createLesson(data: CreateLessonData): Promise<TeacherLessonData> {
    const id = randomUUID();
    await this.pool.query(
      'INSERT INTO lessons (id, subject_id, group_id, date, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, data.subjectId, data.groupId, data.date, data.startTime, data.endTime],
    );
    return { id, ...data };
  }

  async findCourseScheduleBySubject(subjectId: string): Promise<CourseScheduleItem[]> {
    const result = await this.pool.query(
      'SELECT day, time, room FROM course_schedule WHERE course_id = $1 ORDER BY id',
      [subjectId],
    );
    return result.rows.map(r => ({
      day: r.day,
      time: r.time,
      room: r.room,
    }));
  }

  async findGradesByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherGradeData[]> {
    const result = await this.pool.query(
      `SELECT tg.student_id, tg.lesson_id, tg.value, tg.type
       FROM teacher_grades tg
       JOIN lessons l ON l.id = tg.lesson_id
       WHERE l.group_id = $1 AND l.subject_id = $2`,
      [groupId, subjectId],
    );
    return result.rows.map(r => ({
      studentId: r.student_id,
      lessonId: r.lesson_id,
      value: r.value,
      type: r.type,
    }));
  }

  async saveGrade(data: SaveGradeData): Promise<void> {
    await this.pool.query(
      `INSERT INTO teacher_grades (student_id, lesson_id, value, type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, lesson_id) DO UPDATE SET value = EXCLUDED.value, type = EXCLUDED.type`,
      [data.studentId, data.lessonId, data.value, data.type],
    );
  }

  async findAttendancesByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherAttendanceData[]> {
    const result = await this.pool.query(
      `SELECT ta.student_id, ta.lesson_id, ta.status
       FROM teacher_attendance ta
       JOIN lessons l ON l.id = ta.lesson_id
       WHERE l.group_id = $1 AND l.subject_id = $2`,
      [groupId, subjectId],
    );
    return result.rows.map(r => ({
      studentId: r.student_id,
      lessonId: r.lesson_id,
      status: r.status,
    }));
  }

  async saveAttendance(data: SaveAttendanceData): Promise<void> {
    await this.pool.query(
      `INSERT INTO teacher_attendance (student_id, lesson_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, lesson_id) DO UPDATE SET status = EXCLUDED.status`,
      [data.studentId, data.lessonId, data.status],
    );
  }

  async findLessonCountByTeacherAndMonth(teacherId: number, year: number, month: number): Promise<number> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const result = await this.pool.query(
      `SELECT COUNT(*) AS cnt
       FROM lessons l
       JOIN teacher_groups tg ON tg.group_id = l.group_id AND tg.subject_id = l.subject_id
       WHERE tg.teacher_id = $1 AND l.date >= $2 AND l.date < $3`,
      [teacherId, startDate, endDate],
    );
    return Number(result.rows[0].cnt);
  }
}
