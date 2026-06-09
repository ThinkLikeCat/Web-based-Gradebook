// server/src/application/ports/in/teacher.usecase.ts
import { TeacherJournalDto } from '../../dtos/teacher-journal.dto';
import { ProgramItemDto, CreateProgramItemDto } from '../../dtos/teacher-program.dto';
import { LabSubmissionDto, GradeSubmissionDto, TeacherGroupInfoDto } from '../../dtos/teacher-lab.dto';

export interface TeacherUseCase {
  getTeacherGroups(teacherId: number): Promise<TeacherGroupInfoDto[]>;
  getJournal(teacherId: number, groupId: string, subjectId: string): Promise<TeacherJournalDto>;
  setGrade(teacherId: number, data: { studentId: string; lessonId: string; value: number; type: string }): Promise<void>;
  setAttendance(teacherId: number, data: { studentId: string; lessonId: string; status: 'PRESENT' | 'LATE' | 'ABSENT' }): Promise<void>;
  addLesson(teacherId: number, data: { subjectId: string; groupId: string; date: string; startTime: string; endTime: string }): Promise<void>;
  getProgram(teacherId: number, subjectId: string): Promise<ProgramItemDto[]>;
  addProgramItem(teacherId: number, data: CreateProgramItemDto): Promise<ProgramItemDto>;
  updateProgramItem(teacherId: number, itemId: string, data: Partial<CreateProgramItemDto>): Promise<void>;
  deleteProgramItem(teacherId: number, itemId: string): Promise<void>;
  getLabSubmissions(teacherId: number, programId: string): Promise<LabSubmissionDto[]>;
  gradeLabSubmission(teacherId: number, submissionId: string, data: GradeSubmissionDto): Promise<void>;
}