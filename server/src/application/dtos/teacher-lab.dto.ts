export interface LabSubmissionDto {
  id: string;
  studentId: string;
  studentName: string;
  programId: string;
  programTitle: string;
  fileUrl: string;
  comment?: string;
  grade?: number | null;
  status: 'SUBMITTED' | 'CHECKED';
  submittedAt: string;
}

export interface GradeSubmissionDto {
  grade: number;
  comment?: string;
}

export interface TeacherGroupInfoDto {
  groupId: string;
  groupName: string;
  subjectId: string;
  subjectName: string;
}