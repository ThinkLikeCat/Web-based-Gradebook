import { TeacherJournalDto } from '../../dtos/teacher-journal.dto';
import { CreateProgramItemDto } from '../../dtos/teacher-program.dto';
import { GradeSubmissionDto } from '../../dtos/teacher-lab.dto';
import { TeacherGroupInfo } from '../../../domain/repositories/TeacherAccessRepository';
import { ProgramItemData, LabSubmissionData } from '../../../domain/repositories/TeacherProgramRepository';

export interface TeacherUseCase {
  getTeacherGroups(teacherId: number): Promise<TeacherGroupInfo[]>;
  getJournal(teacherId: number, groupId: string, subjectId: string): Promise<TeacherJournalDto>;
  setGrade(teacherId: number, data: { studentId: string; lessonId: string; value: number; type: string }): Promise<void>;
  setAttendance(teacherId: number, data: { studentId: string; lessonId: string; status: 'PRESENT' | 'LATE' | 'ABSENT' }): Promise<void>;
  addLesson(teacherId: number, data: { subjectId: string; groupId: string; date: string; startTime: string; endTime: string }): Promise<void>;
  getProgram(teacherId: number, subjectId: string): Promise<ProgramItemData[]>;
  addProgramItem(teacherId: number, data: CreateProgramItemDto): Promise<ProgramItemData>;
  updateProgramItem(teacherId: number, itemId: string, data: Partial<CreateProgramItemDto>): Promise<void>;
  deleteProgramItem(teacherId: number, itemId: string): Promise<void>;
  getLabSubmissions(teacherId: number, programId: string): Promise<LabSubmissionData[]>;
  gradeLabSubmission(teacherId: number, submissionId: string, data: GradeSubmissionDto): Promise<void>;
}
