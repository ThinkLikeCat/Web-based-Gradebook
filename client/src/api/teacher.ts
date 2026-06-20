import type { JournalCell, SubjectRow } from '../types';
import { apiRequest } from './client';

export type TeacherGroupInfo = {
  groupId: string;
  groupName: string;
  subjectId: string;
  subjectName: string;
};

export async function getTeacherGroups(): Promise<TeacherGroupInfo[]> {
  return apiRequest<TeacherGroupInfo[]>('/api/teacher/groups');
}

export async function getTeacherJournal(groupId: string, subjectId: string): Promise<{
  students: SubjectRow[];
  dates: string[];
  cells: JournalCell[];
  dateLessonMap: Map<string, string>;
}> {
  const data = await apiRequest<{
    groupId: string;
    groupName: string;
    subjectId: string;
    subjectName: string;
    students: Array<{ id: string; fullName: string; isExpelled: boolean; isNew: boolean }>;
    lessons: Array<{ id: string; date: string; startTime: string; endTime: string }>;
    grades: Array<{ studentId: string; lessonId: string; value: number; type: string }>;
    attendances: Array<{ studentId: string; lessonId: string; status: string }>;
  }>(`/api/teacher/journal/${groupId}/${subjectId}`);

  const lessonDateMap = new Map(data.lessons.map(l => [l.id, l.date]));
  const dateLessonMap = new Map(data.lessons.map(l => [l.date, l.id]));
  const dates = data.lessons.map(l => l.date);
  const students: SubjectRow[] = data.students.map(s => ({
    id: s.id,
    name: s.fullName,
    shortName: s.fullName,
  }));

  const cells: JournalCell[] = [];

  for (const g of data.grades) {
    const date = lessonDateMap.get(g.lessonId);
    if (date) {
      cells.push({ subjectId: g.studentId, date, marks: [String(g.value)], absences: [] });
    }
  }

  for (const a of data.attendances) {
    if (a.status === 'PRESENT') continue;
    const date = lessonDateMap.get(a.lessonId);
    if (date) {
      const existing = cells.findIndex(c => c.subjectId === a.studentId && c.date === date);
      const absence = a.status === 'LATE' ? 'ОП' : 'Н';
      if (existing >= 0) {
        cells[existing].absences.push(absence);
      } else {
        cells.push({ subjectId: a.studentId, date, marks: [], absences: [absence] });
      }
    }
  }

  return { students, dates, cells, dateLessonMap };
}

export async function saveGrade(studentId: string, lessonId: string, value: number, type: string): Promise<void> {
  await apiRequest('/api/teacher/grade', {
    method: 'POST',
    body: { studentId, lessonId, value, type },
  });
}

export async function getTeacherStats(): Promise<{ lessonsThisMonth: number; pendingSubmissions: number }> {
  return apiRequest<{ lessonsThisMonth: number; pendingSubmissions: number }>('/api/teacher/stats');
}

export async function saveAttendance(studentId: string, lessonId: string, status: 'PRESENT' | 'LATE' | 'ABSENT'): Promise<void> {
  await apiRequest('/api/teacher/attendance', {
    method: 'POST',
    body: { studentId, lessonId, status },
  });
}

export async function addLesson(data: {
  subjectId: string;
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
}): Promise<void> {
  await apiRequest('/api/teacher/lesson', {
    method: 'POST',
    body: data,
  });
}
