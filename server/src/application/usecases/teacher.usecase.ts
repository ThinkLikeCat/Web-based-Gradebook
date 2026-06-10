import { TeacherUseCase } from '../ports/in/teacher.usecase';
import { TeacherStudentData, TeacherGroupInfo, TeacherAccessRepository } from '../../domain/repositories/TeacherAccessRepository';
import { TeacherLessonData, TeacherGradeData, TeacherAttendanceData, TeacherJournalRepository } from '../../domain/repositories/TeacherJournalRepository';
import { ProgramItemData, LabSubmissionData, TeacherProgramRepository } from '../../domain/repositories/TeacherProgramRepository';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { GradeValue } from '../../domain/value-objects/GradeValue';
import { TeacherJournalDto, TeacherJournalStudentDto, TeacherJournalLessonDto, TeacherJournalGradeDto, TeacherJournalAttendanceDto } from '../dtos/teacher-journal.dto';
import { CreateProgramItemDto } from '../dtos/teacher-program.dto';
import { GradeSubmissionDto } from '../dtos/teacher-lab.dto';

export class TeacherUseCaseImpl implements TeacherUseCase {
  constructor(
    private readonly accessRepo: TeacherAccessRepository,
    private readonly journalRepo: TeacherJournalRepository,
    private readonly programRepo: TeacherProgramRepository,
  ) {}

  async getTeacherGroups(teacherId: number): Promise<TeacherGroupInfo[]> {
    return this.accessRepo.findTeacherGroups(teacherId);
  }

  async getJournal(teacherId: number, groupId: string, subjectId: string): Promise<TeacherJournalDto> {
    const hasAccess = await this.accessRepo.checkTeacherAccess(teacherId, groupId, subjectId);
    if (!hasAccess) {
      throw new NotFoundError('Teacher does not teach this subject in this group');
    }

    const group = await this.accessRepo.findGroupById(groupId);
    const subject = await this.accessRepo.findSubjectById(subjectId);
    const students = await this.accessRepo.findStudentsByGroup(groupId);
    const lessons = await this.journalRepo.findLessonsByGroupAndSubject(groupId, subjectId);
    const grades = await this.journalRepo.findGradesByGroupAndSubject(groupId, subjectId);
    const attendances = await this.journalRepo.findAttendancesByGroupAndSubject(groupId, subjectId);

    return {
      groupId,
      groupName: group?.name || 'Unknown',
      subjectId,
      subjectName: subject?.name || 'Unknown',
      students: students.map((s: TeacherStudentData): TeacherJournalStudentDto => ({
        id: s.id,
        fullName: s.fullName,
        isExpelled: s.isExpelled,
        isNew: s.isNew,
      })),
      lessons: lessons.map((l: TeacherLessonData): TeacherJournalLessonDto => ({
        id: l.id,
        date: l.date,
        startTime: l.startTime,
        endTime: l.endTime,
      })),
      grades: grades.map((g: TeacherGradeData): TeacherJournalGradeDto => ({
        studentId: g.studentId,
        lessonId: g.lessonId,
        value: g.value,
        type: g.type,
      })),
      attendances: attendances.map((a: TeacherAttendanceData): TeacherJournalAttendanceDto => ({
        studentId: a.studentId,
        lessonId: a.lessonId,
        status: a.status as TeacherJournalAttendanceDto['status'],
      })),
    };
  }

  async setGrade(teacherId: number, data: { studentId: string; lessonId: string; value: number; type: string }): Promise<void> {
    const gradeValue = GradeValue.create(data.value);

    const lesson = await this.journalRepo.findLessonById(data.lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');

    const hasAccess = await this.accessRepo.checkTeacherAccess(teacherId, lesson.groupId, lesson.subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    await this.journalRepo.saveGrade({
      studentId: data.studentId,
      lessonId: data.lessonId,
      value: gradeValue.getValue(),
      type: data.type,
    });
  }

  async setAttendance(teacherId: number, data: { studentId: string; lessonId: string; status: 'PRESENT' | 'LATE' | 'ABSENT' }): Promise<void> {
    const lesson = await this.journalRepo.findLessonById(data.lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');

    const hasAccess = await this.accessRepo.checkTeacherAccess(teacherId, lesson.groupId, lesson.subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    await this.journalRepo.saveAttendance({
      studentId: data.studentId,
      lessonId: data.lessonId,
      status: data.status,
    });
  }

  async addLesson(teacherId: number, data: { subjectId: string; groupId: string; date: string; startTime: string; endTime: string }): Promise<void> {
    const hasAccess = await this.accessRepo.checkTeacherAccess(teacherId, data.groupId, data.subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    await this.journalRepo.createLesson(data);
  }

  async getProgram(teacherId: number, subjectId: string): Promise<ProgramItemData[]> {
    const hasAccess = await this.accessRepo.checkTeacherSubjectAccess(teacherId, subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    return this.programRepo.findProgramBySubject(subjectId);
  }

  async addProgramItem(teacherId: number, data: CreateProgramItemDto): Promise<ProgramItemData> {
    const hasAccess = await this.accessRepo.checkTeacherSubjectAccess(teacherId, data.subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    return this.programRepo.createProgramItem(data);
  }

  async updateProgramItem(teacherId: number, itemId: string, data: Partial<CreateProgramItemDto>): Promise<void> {
    const item = await this.programRepo.findProgramItemById(itemId);
    if (!item) {
      throw new NotFoundError('Program item not found');
    }

    const hasAccess = await this.accessRepo.checkTeacherSubjectAccess(teacherId, item.subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    await this.programRepo.updateProgramItem(itemId, data);
  }

  async deleteProgramItem(teacherId: number, itemId: string): Promise<void> {
    const item = await this.programRepo.findProgramItemById(itemId);
    if (!item) {
      throw new NotFoundError('Program item not found');
    }

    const hasAccess = await this.accessRepo.checkTeacherSubjectAccess(teacherId, item.subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    await this.programRepo.deleteProgramItem(itemId);
  }

  async getLabSubmissions(teacherId: number, programId: string): Promise<LabSubmissionData[]> {
    const program = await this.programRepo.findProgramItemById(programId);
    if (!program) {
      throw new NotFoundError('Program not found');
    }

    const hasAccess = await this.accessRepo.checkTeacherSubjectAccess(teacherId, program.subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    return this.programRepo.findLabSubmissionsByProgram(programId);
  }

  async gradeLabSubmission(teacherId: number, submissionId: string, data: GradeSubmissionDto): Promise<void> {
    const submission = await this.programRepo.findLabSubmissionById(submissionId);
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    const program = await this.programRepo.findProgramItemById(submission.programId);
    if (!program) {
      throw new NotFoundError('Program not found');
    }

    const hasAccess = await this.accessRepo.checkTeacherSubjectAccess(teacherId, program.subjectId);
    if (!hasAccess) throw new UnauthorizedError('Access denied');

    const gradeValue = GradeValue.create(data.grade);
    await this.programRepo.updateLabSubmission(submissionId, {
      grade: gradeValue.getValue(),
      comment: data.comment,
      status: 'graded',
    });
  }
}
