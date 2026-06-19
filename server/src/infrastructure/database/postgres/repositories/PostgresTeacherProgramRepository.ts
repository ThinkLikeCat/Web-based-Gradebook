import { Pool } from 'pg';
import { TeacherProgramRepository, ProgramItemData, LabSubmissionData } from '../../../../domain/repositories/TeacherProgramRepository';

export class PostgresTeacherProgramRepository implements TeacherProgramRepository {
  constructor(private readonly pool: Pool) {}

  async findProgramBySubject(subjectId: string): Promise<ProgramItemData[]> {
    const result = await this.pool.query(
      'SELECT id, subject_id, title, type, deadline, description, file_url FROM programs WHERE subject_id = $1 ORDER BY deadline',
      [subjectId],
    );
    return result.rows.map(r => ({
      id: r.id,
      subjectId: r.subject_id,
      title: r.title,
      type: r.type,
      deadline: r.deadline ?? undefined,
      description: r.description ?? undefined,
      fileUrl: r.file_url ?? undefined,
    }));
  }

  async findProgramItemById(itemId: string): Promise<ProgramItemData | null> {
    const result = await this.pool.query(
      'SELECT id, subject_id, title, type, deadline, description, file_url FROM programs WHERE id = $1',
      [itemId],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return {
      id: r.id,
      subjectId: r.subject_id,
      title: r.title,
      type: r.type,
      deadline: r.deadline ?? undefined,
      description: r.description ?? undefined,
      fileUrl: r.file_url ?? undefined,
    };
  }

  async createProgramItem(data: Omit<ProgramItemData, 'id'>): Promise<ProgramItemData> {
    const id = `program-${Date.now()}`;
    await this.pool.query(
      'INSERT INTO programs (id, subject_id, title, type, deadline, description, file_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, data.subjectId, data.title, data.type, data.deadline ?? null, data.description ?? null, data.fileUrl ?? null],
    );
    return { id, ...data };
  }

  async updateProgramItem(itemId: string, data: Partial<Omit<ProgramItemData, 'id'>>): Promise<void> {
    const sets: string[] = [];
    const params: (string | number | null | undefined)[] = [];
    let idx = 1;

    if (data.subjectId !== undefined) { sets.push(`subject_id = $${idx++}`); params.push(data.subjectId); }
    if (data.title !== undefined) { sets.push(`title = $${idx++}`); params.push(data.title); }
    if (data.type !== undefined) { sets.push(`type = $${idx++}`); params.push(data.type); }
    if (data.deadline !== undefined) { sets.push(`deadline = $${idx++}`); params.push(data.deadline); }
    if (data.description !== undefined) { sets.push(`description = $${idx++}`); params.push(data.description); }
    if (data.fileUrl !== undefined) { sets.push(`file_url = $${idx++}`); params.push(data.fileUrl); }

    if (sets.length === 0) return;
    params.push(itemId);
    await this.pool.query(`UPDATE programs SET ${sets.join(', ')} WHERE id = $${idx}`, params);
  }

  async deleteProgramItem(itemId: string): Promise<void> {
    await this.pool.query('DELETE FROM programs WHERE id = $1', [itemId]);
  }

  async findLabSubmissionsByProgram(programId: string): Promise<LabSubmissionData[]> {
    const result = await this.pool.query(
      `SELECT id, student_id, student_name, program_id, program_title, file_url, comment, grade, status, submitted_at
       FROM teacher_lab_submissions WHERE program_id = $1`,
      [programId],
    );
    return result.rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      studentName: r.student_name,
      programId: r.program_id,
      programTitle: r.program_title,
      fileUrl: r.file_url,
      comment: r.comment ?? undefined,
      grade: r.grade ?? null,
      status: r.status,
      submittedAt: r.submitted_at,
    }));
  }

  async findLabSubmissionById(submissionId: string): Promise<LabSubmissionData | null> {
    const result = await this.pool.query(
      `SELECT id, student_id, student_name, program_id, program_title, file_url, comment, grade, status, submitted_at
       FROM teacher_lab_submissions WHERE id = $1`,
      [submissionId],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return {
      id: r.id,
      studentId: r.student_id,
      studentName: r.student_name,
      programId: r.program_id,
      programTitle: r.program_title,
      fileUrl: r.file_url,
      comment: r.comment ?? undefined,
      grade: r.grade ?? null,
      status: r.status,
      submittedAt: r.submitted_at,
    };
  }

  async findPendingSubmissionCountByTeacher(teacherId: number): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*) AS cnt
       FROM teacher_lab_submissions tls
       JOIN programs p ON p.id = tls.program_id
       JOIN teacher_groups tg ON tg.subject_id = p.subject_id
       WHERE tg.teacher_id = $1 AND tls.grade IS NULL AND tls.status = 'submitted'`,
      [teacherId],
    );
    return Number(result.rows[0].cnt);
  }

  async updateLabSubmission(submissionId: string, data: Partial<Omit<LabSubmissionData, 'id'>>): Promise<void> {
    const sets: string[] = [];
    const params: (string | number | null | undefined)[] = [];
    let idx = 1;

    if (data.studentId !== undefined) { sets.push(`student_id = $${idx++}`); params.push(data.studentId); }
    if (data.studentName !== undefined) { sets.push(`student_name = $${idx++}`); params.push(data.studentName); }
    if (data.programId !== undefined) { sets.push(`program_id = $${idx++}`); params.push(data.programId); }
    if (data.programTitle !== undefined) { sets.push(`program_title = $${idx++}`); params.push(data.programTitle); }
    if (data.fileUrl !== undefined) { sets.push(`file_url = $${idx++}`); params.push(data.fileUrl); }
    if (data.comment !== undefined) { sets.push(`comment = $${idx++}`); params.push(data.comment); }
    if (data.grade !== undefined) { sets.push(`grade = $${idx++}`); params.push(data.grade); }
    if (data.status !== undefined) { sets.push(`status = $${idx++}`); params.push(data.status); }
    if (data.submittedAt !== undefined) { sets.push(`submitted_at = $${idx++}`); params.push(data.submittedAt); }

    if (sets.length === 0) return;
    params.push(submissionId);
    await this.pool.query(`UPDATE teacher_lab_submissions SET ${sets.join(', ')} WHERE id = $${idx}`, params);
  }
}
