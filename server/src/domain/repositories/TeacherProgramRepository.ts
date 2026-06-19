export interface ProgramItemData {
  id: string;
  subjectId: string;
  title: string;
  type: 'LAB' | 'THEORY' | 'PRACTICAL' | 'CONTROL';
  deadline?: string;
  description?: string;
  fileUrl?: string;
}

export interface LabSubmissionData {
  id: string;
  studentId: string;
  studentName: string;
  programId: string;
  programTitle: string;
  fileUrl: string;
  comment?: string;
  grade?: number | null;
  status: string;
  submittedAt: string;
}

export interface TeacherProgramRepository {
  findProgramBySubject(subjectId: string): Promise<ProgramItemData[]>;
  findProgramItemById(itemId: string): Promise<ProgramItemData | null>;
  createProgramItem(data: Omit<ProgramItemData, 'id'>): Promise<ProgramItemData>;
  updateProgramItem(itemId: string, data: Partial<Omit<ProgramItemData, 'id'>>): Promise<void>;
  deleteProgramItem(itemId: string): Promise<void>;
  findLabSubmissionsByProgram(programId: string): Promise<LabSubmissionData[]>;
  findLabSubmissionById(submissionId: string): Promise<LabSubmissionData | null>;
  updateLabSubmission(submissionId: string, data: Partial<Omit<LabSubmissionData, 'id'>>): Promise<void>;
  findPendingSubmissionCountByTeacher(teacherId: number): Promise<number>;
}
