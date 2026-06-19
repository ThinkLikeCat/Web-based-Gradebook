import { Pool } from 'pg';
import { StudentReadRepository } from '../../../../domain/repositories/StudentReadRepository';
import { Student } from '../../../../domain/entities/Student';
import { Course } from '../../../../domain/entities/Course';
import { Grade } from '../../../../domain/entities/Grade';
import { Attendance } from '../../../../domain/entities/Attendance';
import { LabWork } from '../../../../domain/entities/LabWork';
import { LabSubmission } from '../../../../domain/entities/LabSubmission';
import { StudentId } from '../../../../domain/value-objects/StudentId';
import { CourseId } from '../../../../domain/value-objects/CourseId';
import { LabWorkId } from '../../../../domain/value-objects/LabWorkId';

export class PostgresStudentReadRepository implements StudentReadRepository {
  constructor(private readonly pool: Pool) {}

  async findStudentById(studentId: string): Promise<Student | null> {
    const result = await this.pool.query('SELECT id, name, group_name FROM students WHERE id = $1', [studentId]);
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return new Student(new StudentId(r.id), r.name, r.group_name);
  }

  async findScheduleByStudentId(studentId: string): Promise<Array<{ course: Course }>> {
    const result = await this.pool.query(
      `SELECT c.id, c.name, c.teacher_name,
              COALESCE(json_agg(json_build_object('day', cs.day, 'time', cs.time, 'room', cs.room) ORDER BY cs.id) FILTER (WHERE cs.id IS NOT NULL), '[]') AS schedule
       FROM courses c
       JOIN student_courses sc ON sc.course_id = c.id
       LEFT JOIN course_schedule cs ON cs.course_id = c.id
       WHERE sc.student_id = $1
       GROUP BY c.id, c.name, c.teacher_name`,
      [studentId],
    );
    return result.rows.map((r: any) => ({
      course: new Course(new CourseId(r.id), r.name, r.teacher_name, r.schedule),
    }));
  }

  async findGradesByStudentId(studentId: string): Promise<Grade[]> {
    const result = await this.pool.query(
      `SELECT tg.student_id, l.subject_id, tg.value, tg.type, l.date
       FROM teacher_grades tg
       JOIN lessons l ON l.id = tg.lesson_id
       WHERE tg.student_id = $1`,
      [studentId],
    );
    return result.rows.map(r => new Grade(r.student_id, r.subject_id, r.value, r.type, r.date));
  }

  async findAttendanceByStudentId(studentId: string): Promise<Attendance[]> {
    const result = await this.pool.query(
      `SELECT ta.student_id, l.subject_id, l.date, ta.status
       FROM teacher_attendance ta
       JOIN lessons l ON l.id = ta.lesson_id
       WHERE ta.student_id = $1`,
      [studentId],
    );
    return result.rows.map(r => new Attendance(r.student_id, r.subject_id, r.date, r.status));
  }

  async findCourseById(courseId: string): Promise<Course | null> {
    const result = await this.pool.query(
      `SELECT c.id, c.name, c.teacher_name,
              COALESCE(json_agg(json_build_object('day', cs.day, 'time', cs.time, 'room', cs.room) ORDER BY cs.id) FILTER (WHERE cs.id IS NOT NULL), '[]') AS schedule
       FROM courses c
       LEFT JOIN course_schedule cs ON cs.course_id = c.id
       WHERE c.id = $1
       GROUP BY c.id, c.name, c.teacher_name`,
      [courseId],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return new Course(new CourseId(r.id), r.name, r.teacher_name, r.schedule);
  }

  async findCoursesByIds(courseIds: string[]): Promise<Course[]> {
    if (courseIds.length === 0) return [];
    const result = await this.pool.query(
      `SELECT c.id, c.name, c.teacher_name,
              COALESCE(json_agg(json_build_object('day', cs.day, 'time', cs.time, 'room', cs.room) ORDER BY cs.id) FILTER (WHERE cs.id IS NOT NULL), '[]') AS schedule
       FROM courses c
       LEFT JOIN course_schedule cs ON cs.course_id = c.id
       WHERE c.id = ANY($1::text[])
       GROUP BY c.id, c.name, c.teacher_name`,
      [courseIds],
    );
    return result.rows.map((r: any) => new Course(new CourseId(r.id), r.name, r.teacher_name, r.schedule));
  }

  async findLabWorkById(labId: string): Promise<LabWork | null> {
    const result = await this.pool.query(
      `SELECT l.id, l.subject_id, l.title, l.issue_date, l.due_date, l.team_work, l.theory_materials,
              COALESCE(json_agg(json_build_object('id', lp.student_id, 'name', lp.name) ORDER BY lp.id) FILTER (WHERE lp.id IS NOT NULL), '[]') AS partners
       FROM labs l
       LEFT JOIN lab_partners lp ON lp.lab_id = l.id
       WHERE l.id = $1
       GROUP BY l.id, l.subject_id, l.title, l.issue_date, l.due_date, l.team_work, l.theory_materials`,
      [labId],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return new LabWork(new LabWorkId(r.id), r.subject_id, r.title, r.issue_date, r.due_date, r.team_work, r.theory_materials, r.partners);
  }

  async findLabSubmission(studentId: string, labId: string): Promise<LabSubmission | null> {
    const result = await this.pool.query(
      'SELECT lab_id, student_id, submission_date, file_url, teacher_comment, teacher_grade, status FROM lab_submissions WHERE student_id = $1 AND lab_id = $2',
      [studentId, labId],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return new LabSubmission(r.lab_id, r.student_id, r.submission_date, r.file_url, r.teacher_comment, r.teacher_grade, r.status);
  }
}
