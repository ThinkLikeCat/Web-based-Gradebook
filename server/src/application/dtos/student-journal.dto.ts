export type StudentGradeDto = {
  subjectId: string;
  subjectName: string;
  type: string;
  value: number;
  date: string;
};

export type StudentAttendanceDto = {
  subjectId: string;
  subjectName: string;
  date: string;
  status: string;
};

export type StudentJournalDto = {
  studentId: string;
  studentName: string;
  grades: StudentGradeDto[];
  attendance: StudentAttendanceDto[];
};
