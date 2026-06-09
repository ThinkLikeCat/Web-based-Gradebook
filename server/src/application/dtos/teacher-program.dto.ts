export interface ProgramItemDto {
  id: number;
  subjectId: number;
  title: string;
  type: 'LAB' | 'THEORY' | 'PRACTICAL' | 'CONTROL';
  deadline?: string;
  description?: string;
  fileUrl?: string;
}

export interface CreateProgramItemDto {
  subjectId: number;
  title: string;
  type: 'LAB' | 'THEORY' | 'PRACTICAL' | 'CONTROL';
  deadline?: string;
  description?: string;
  fileUrl?: string;
}