import { Pool } from 'pg';
import { TeacherAccessRepository, TeacherGroupData, TeacherSubjectData, TeacherStudentData, TeacherGroupInfo } from '../../../../domain/repositories/TeacherAccessRepository';

export class PostgresTeacherAccessRepository implements TeacherAccessRepository {
  constructor(private readonly pool: Pool) {}

  async findTeacherGroups(teacherId: number): Promise<TeacherGroupInfo[]> {
    const result = await this.pool.query(
      `SELECT tg.group_id, g.name AS group_name, tg.subject_id, s.name AS subject_name
       FROM teacher_groups tg
       JOIN groups_info g ON g.id = tg.group_id
       JOIN subjects s ON s.id = tg.subject_id
       WHERE tg.teacher_id = $1`,
      [teacherId],
    );
    return result.rows.map(r => ({
      groupId: r.group_id,
      groupName: r.group_name,
      subjectId: r.subject_id,
      subjectName: r.subject_name,
    }));
  }

  async checkTeacherAccess(teacherId: number, groupId: string, subjectId: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT 1 FROM teacher_groups WHERE teacher_id = $1 AND group_id = $2 AND subject_id = $3 LIMIT 1',
      [teacherId, groupId, subjectId],
    );
    return result.rows.length > 0;
  }

  async checkTeacherSubjectAccess(teacherId: number, subjectId: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT 1 FROM teacher_groups WHERE teacher_id = $1 AND subject_id = $2 LIMIT 1',
      [teacherId, subjectId],
    );
    return result.rows.length > 0;
  }

  async findGroupById(groupId: string): Promise<TeacherGroupData | null> {
    const result = await this.pool.query('SELECT id, name FROM groups_info WHERE id = $1', [groupId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async findSubjectById(subjectId: string): Promise<TeacherSubjectData | null> {
    const result = await this.pool.query('SELECT id, name FROM subjects WHERE id = $1', [subjectId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async findStudentsByGroup(groupId: string): Promise<TeacherStudentData[]> {
    const result = await this.pool.query(
      'SELECT id, full_name, group_id, is_expelled, is_new FROM teacher_students WHERE group_id = $1',
      [groupId],
    );
    return result.rows.map(r => ({
      id: r.id,
      fullName: r.full_name,
      groupId: r.group_id,
      isExpelled: r.is_expelled,
      isNew: r.is_new,
    }));
  }
}
