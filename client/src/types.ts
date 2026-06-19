export type Role = 'student' | 'teacher';
export type JournalMode = 'marks' | 'absences';
export type ThemeColor = 'blue' | 'black' | 'green' | 'purple' | 'orange';

export type User = {
  id: string;
  role: Role;
  fullName: string;
  lastName: string;
  group?: string;
  studentId?: string;
};

export type AuthTokens = {
  token: string;
  refreshToken: string;
};

export type AuthResponse = {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    fullName: string;
    role: 'STUDENT' | 'TEACHER';
    group?: string;
    groupId?: string;
    studentId?: string;
  };
};

export type Deadline = {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'soon' | 'today' | 'overdue';
};

export type Exam = {
  id: string;
  subject: string;
  date: string;
  time: string;
  room: string;
};

export type ScheduleItem = {
  id: string;
  time: string;
  subject: string;
  room: string;
  note: string;
};

export type PlannedWork = {
  id: string;
  group: string;
  subject: string;
  type: 'lab' | 'required-test' | 'test' | 'exam';
  title: string;
  date: string;
  deadline?: string;
  room?: string;
  comment: string;
};

export type JournalCell = {
  subjectId: string;
  date: string;
  marks: string[];
  absences: string[];
  comment?: string;
};

export type SubjectRow = {
  id: string;
  name: string;
  shortName: string;
};

export type Semester = 1 | 2;

export type LayoutMode = 'modern' | 'classic';

export type TeacherChoice = {
  group: string;
  subject: string;
};

export type AppRoute = 'dashboard' | 'journal' | 'schedule' | 'settings';
