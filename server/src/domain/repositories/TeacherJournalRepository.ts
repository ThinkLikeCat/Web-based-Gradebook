export interface TeacherLessonData {
  id: string;
  subjectId: string;
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface TeacherGradeData {
  studentId: string;
  lessonId: string;
  value: number;
  type: string;
}

export interface TeacherAttendanceData {
  studentId: string;
  lessonId: string;
  status: string;
}

export interface CreateLessonData {
  subjectId: string;
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface SaveGradeData {
  studentId: string;
  lessonId: string;
  value: number;
  type: string;
}

export interface SaveAttendanceData {
  studentId: string;
  lessonId: string;
  status: string;
}

export interface CourseScheduleItem {
  day: string;
  time: string;
  room: string;
}

export interface TeacherJournalRepository {
  findLessonsByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherLessonData[]>;
  findLessonById(lessonId: string): Promise<TeacherLessonData | null>;
  createLesson(data: CreateLessonData): Promise<TeacherLessonData>;
  findCourseScheduleBySubject(subjectId: string): Promise<CourseScheduleItem[]>;
  findGradesByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherGradeData[]>;
  saveGrade(data: SaveGradeData): Promise<void>;
  findAttendancesByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherAttendanceData[]>;
  saveAttendance(data: SaveAttendanceData): Promise<void>;
  findLessonCountByTeacherAndMonth(teacherId: number, year: number, month: number): Promise<number>;
}
