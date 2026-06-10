import type { JournalCell, SubjectRow } from '../types';
import { apiRequest } from './client';

export type StudentJournalResponse = {
  dates: string[];
  subjects: SubjectRow[];
  cells: JournalCell[];
};

export async function getStudentSchedule(studentId: string) {
  return apiRequest<{
    studentId: string;
    studentName: string;
    schedule: Array<{
      subjectId: string;
      subjectName: string;
      teacherName: string;
      day: string;
      time: string;
      room: string;
    }>;
  }>(`/api/students/${studentId}/schedule`);
}

export async function getStudentJournal(studentId: string): Promise<StudentJournalResponse> {
  const data = await apiRequest<{
    studentId: string;
    studentName: string;
    grades: Array<{ subjectId: string; subjectName: string; type: string; value: number; date: string }>;
    attendance: Array<{ subjectId: string; subjectName: string; date: string; status: string }>;
  }>(`/api/students/${studentId}/journal`);

  const subjectMap = new Map<string, SubjectRow>();
  const dateSet = new Set<string>();
  const gradesByKey = new Map<string, string[]>();
  const absencesByKey = new Map<string, string[]>();

  for (const g of data.grades) {
    if (!subjectMap.has(g.subjectId)) {
      subjectMap.set(g.subjectId, { id: g.subjectId, name: g.subjectName, shortName: g.subjectName });
    }
    dateSet.add(g.date);
    const key = `${g.subjectId}|${g.date}`;
    const arr = gradesByKey.get(key) || [];
    arr.push(String(g.value));
    gradesByKey.set(key, arr);
  }

  for (const a of data.attendance) {
    if (a.status === 'PRESENT') continue;
    if (!subjectMap.has(a.subjectId)) {
      subjectMap.set(a.subjectId, { id: a.subjectId, name: a.subjectName, shortName: a.subjectName });
    }
    dateSet.add(a.date);
    const key = `${a.subjectId}|${a.date}`;
    const arr = absencesByKey.get(key) || [];
    arr.push(a.status === 'LATE' ? 'ОП' : 'Н');
    absencesByKey.set(key, arr);
  }

  const dates = [...dateSet].sort();
  const subjects = [...subjectMap.values()];
  const cells: JournalCell[] = [];

  for (const [key, marks] of gradesByKey) {
    const [subjectId, date] = key.split('|');
    cells.push({ subjectId, date, marks, absences: absencesByKey.get(key) || [] });
  }
  for (const [key, absences] of absencesByKey) {
    const [subjectId, date] = key.split('|');
    if (!gradesByKey.has(key)) {
      cells.push({ subjectId, date, marks: [], absences });
    }
  }

  return { dates, subjects, cells };
}
