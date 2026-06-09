import { ProgramItemDto } from '../../application/dtos/teacher-program.dto';
import { LabSubmissionDto } from '../../application/dtos/teacher-lab.dto';

export interface TeacherProgramRepository {
  findProgramBySubject(subjectId: string): Promise<ProgramItemDto[]>;
  findProgramItemById(itemId: string): Promise<ProgramItemDto | null>;
  createProgramItem(data: Omit<ProgramItemDto, 'id'>): Promise<ProgramItemDto>;
  updateProgramItem(itemId: string, data: Partial<Omit<ProgramItemDto, 'id'>>): Promise<void>;
  deleteProgramItem(itemId: string): Promise<void>;
  findLabSubmissionsByProgram(programId: string): Promise<LabSubmissionDto[]>;
  findLabSubmissionById(submissionId: string): Promise<LabSubmissionDto | null>;
  updateLabSubmission(submissionId: string, data: Partial<Omit<LabSubmissionDto, 'id'>>): Promise<void>;
}
