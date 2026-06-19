export interface LabSubmissionDto {
  id: string;
  studentId: string;
  studentName: string;
  programId: string;
  programTitle: string;
  fileUrl: string;
  comment?: string;
  grade?: number | null;
  status: 'submitted' | 'pending' | 'graded';
  submittedAt: string;
}

export interface GradeSubmissionDto {
  grade: number;
  comment?: string;
}
