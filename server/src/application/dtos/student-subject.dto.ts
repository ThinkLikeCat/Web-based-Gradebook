export type StudentSubjectProgressDto = {
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  grades: {
    type: string;
    value: number;
    date: string;
  }[];
  attendance: {
    date: string;
    status: string;
  }[];
  summary: string;
};
