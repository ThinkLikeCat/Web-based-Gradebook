export interface TeacherJournalDto {
  groupId: string;
  groupName: string;
  subjectId: string;
  subjectName: string;
  students: TeacherJournalStudentDto[];
  lessons: TeacherJournalLessonDto[];
  grades: TeacherJournalGradeDto[];
  attendances: TeacherJournalAttendanceDto[];
}

export interface TeacherJournalStudentDto {
  id: string;
  fullName: string;
  isExpelled: boolean;
  isNew: boolean;
}

export interface TeacherJournalLessonDto {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface TeacherJournalGradeDto {
  studentId: string;
  lessonId: string;
  value: number;
  type: string;
}

export interface TeacherJournalAttendanceDto {
  studentId: string;
  lessonId: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
}