import { TeacherUseCase } from '../ports/in/teacher.usecase';
import { InMemoryTeacherRepository } from '../../infrastructure/database/repositories/in-memory-teacher.repository';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { GradeValue } from '../../domain/value-objects/GradeValue';
import { TeacherJournalDto } from '../dtos/teacher-journal.dto';
import { ProgramItemDto, CreateProgramItemDto } from '../dtos/teacher-program.dto';
import { LabSubmissionDto, GradeSubmissionDto, TeacherGroupInfoDto } from '../dtos/teacher-lab.dto';

export class TeacherUseCaseImpl implements TeacherUseCase {
  constructor(private readonly repository: InMemoryTeacherRepository) {}

  async getTeacherGroups(teacherId: number): Promise<TeacherGroupInfoDto[]> {
    return this.repository.findTeacherGroups(teacherId);
  }

  async getJournal(teacherId: number, groupId: string, subjectId: string): Promise<TeacherJournalDto> {
    const hasAccess = await this.repository.checkTeacherAccess(teacherId, groupId, subjectId);
    if (!hasAccess) {
      throw new NotFoundError('Teacher does not teach this subject in this group');
    }

    const group = await this.repository.findGroupById(groupId);
    const subject = await this.repository.findSubjectById(subjectId);
    const students = await this.repository.findStudentsByGroup(groupId);
    const lessons = await this.repository.findLessonsByGroupAndSubject(groupId, subjectId);
    const grades = await this.repository.findGradesByGroupAndSubject(groupId, subjectId);
    const attendances = await this.repository.findAttendancesByGroupAndSubject(groupId, subjectId);

    return {
      groupId,
      groupName: group?.name || 'Unknown',
      subjectId,
      subjectName: subject?.name || 'Unknown',
      students: students.map((s: any) => ({
        id: s.id,
        fullName: s.fullName,
        isExpelled: s.isExpelled,
        isNew: s.isNew,
      })),
      lessons: lessons.map((l: any) => ({
        id: l.id,
        date: l.date,
        startTime: l.startTime,
        endTime: l.endTime,
      })),
      grades: grades.map((g: any) => ({
        studentId: g.studentId,
        lessonId: g.lessonId,
        value: g.value,
        type: g.type,
      })),
      attendances: attendances.map((a: any) => ({
        studentId: a.studentId,
        lessonId: a.lessonId,
        status: a.status,
      })),
    };
  }

  async setGrade(teacherId: number, data: { studentId: string; lessonId: string; value: number; type: string }): Promise<void> {
    const gradeValue = GradeValue.create(data.value);
    
    const lesson = await this.repository.findLessonById(data.lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');
    
    const hasAccess = await this.repository.checkTeacherAccess(teacherId, lesson.groupId, lesson.subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    await this.repository.saveGrade({
      studentId: data.studentId,
      lessonId: data.lessonId,
      value: gradeValue.getValue(),
      type: data.type,
    });
  }

  async setAttendance(teacherId: number, data: { studentId: string; lessonId: string; status: 'PRESENT' | 'LATE' | 'ABSENT' }): Promise<void> {
    const lesson = await this.repository.findLessonById(data.lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');
    
    const hasAccess = await this.repository.checkTeacherAccess(teacherId, lesson.groupId, lesson.subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    await this.repository.saveAttendance({
      studentId: data.studentId,
      lessonId: data.lessonId,
      status: data.status,
    });
  }

  async addLesson(teacherId: number, data: { subjectId: string; groupId: string; date: string; startTime: string; endTime: string }): Promise<void> {
    const hasAccess = await this.repository.checkTeacherAccess(teacherId, data.groupId, data.subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    await this.repository.createLesson(data);
  }

  async getProgram(teacherId: number, subjectId: string): Promise<ProgramItemDto[]> {
    const hasAccess = await this.repository.checkTeacherSubjectAccess(teacherId, subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    return this.repository.findProgramBySubject(subjectId);
  }

  async addProgramItem(teacherId: number, data: CreateProgramItemDto): Promise<ProgramItemDto> {
    const hasAccess = await this.repository.checkTeacherSubjectAccess(teacherId, data.subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    return this.repository.createProgramItem(data);
  }

  async updateProgramItem(teacherId: number, itemId: string, data: Partial<CreateProgramItemDto>): Promise<void> {
    const item = await this.repository.findProgramItemById(itemId);
    if (!item) {
      throw new NotFoundError('Program item not found');
    }
    
    const hasAccess = await this.repository.checkTeacherSubjectAccess(teacherId, item.subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    await this.repository.updateProgramItem(itemId, data);
  }

  async deleteProgramItem(teacherId: number, itemId: string): Promise<void> {
    const item = await this.repository.findProgramItemById(itemId);
    if (!item) {
      throw new NotFoundError('Program item not found');
    }
    
    const hasAccess = await this.repository.checkTeacherSubjectAccess(teacherId, item.subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    await this.repository.deleteProgramItem(itemId);
  }

  async getLabSubmissions(teacherId: number, programId: string): Promise<LabSubmissionDto[]> {
    const program = await this.repository.findProgramItemById(programId);
    if (!program) {
      throw new NotFoundError('Program not found');
    }
    
    const hasAccess = await this.repository.checkTeacherSubjectAccess(teacherId, program.subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    return this.repository.findLabSubmissionsByProgram(programId);
  }

  async gradeLabSubmission(teacherId: number, submissionId: string, data: GradeSubmissionDto): Promise<void> {
    const submission = await this.repository.findLabSubmissionById(submissionId);
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }
    
    const program = await this.repository.findProgramItemById(submission.programId);
    if (!program) {
      throw new NotFoundError('Program not found');
    }
    
    const hasAccess = await this.repository.checkTeacherSubjectAccess(teacherId, program.subjectId);
    if (!hasAccess) throw new Error('Access denied');
    
    const gradeValue = GradeValue.create(data.grade);
    await this.repository.updateLabSubmission(submissionId, {
      grade: gradeValue.getValue(),
      comment: data.comment,
      status: 'CHECKED',
    });
  }
}