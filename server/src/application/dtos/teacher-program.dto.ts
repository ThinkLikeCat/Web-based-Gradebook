export interface ProgramItemDto {
  id: string;
  subjectId: string;
  title: string;
  type: 'LAB' | 'THEORY' | 'PRACTICAL' | 'CONTROL';
  deadline?: string;
  description?: string;
  fileUrl?: string;
}

export interface CreateProgramItemDto {
  subjectId: string;
  title: string;
  type: 'LAB' | 'THEORY' | 'PRACTICAL' | 'CONTROL';
  deadline?: string;
  description?: string;
  fileUrl?: string;
}