export type Role = 'student' | 'teacher';
export type JournalMode = 'marks' | 'absences';
export type Semester = 1 | 2;
export type ThemeColor = 'blue' | 'black' | 'green' | 'purple' | 'orange';
export type LayoutMode = 'classic' | 'modern';

export type User = {
  id: string;
  role: Role;
  fullName: string;
  lastName: string;
  group?: string;
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
  workNumber?: string;
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

export type TeacherChoice = {
  group: string;
  subject: string;
};
