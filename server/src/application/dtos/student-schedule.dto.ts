export type StudentScheduleItemDto = {
  subjectId: string;
  subjectName: string;
  teacherName: string;
  day: string;
  time: string;
  room: string;
};

export type StudentScheduleDto = {
  studentId: string;
  studentName: string;
  schedule: StudentScheduleItemDto[];
};
