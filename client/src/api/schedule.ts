import { deadlines, exams, schedule as mockSchedule } from '../data/mockData';
import type { Deadline, Exam, ScheduleItem } from '../types';
import { apiRequest } from './client';

type DashboardData = {
  deadlines: Deadline[];
  exams: Exam[];
  schedule: ScheduleItem[];
};

function getStoredStudentId(): string {
  try {
    const raw = sessionStorage.getItem('gradebook_user');
    if (!raw) return '';
    return JSON.parse(raw).studentId || '';
  } catch {
    return '';
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const studentId = getStoredStudentId();
  if (studentId) {
    try {
      const data = await apiRequest<{
        schedule: Array<{ subjectId: string; subjectName: string; teacherName: string; day: string; time: string; room: string }>;
      }>(`/api/students/${studentId}/schedule`);

      return {
        deadlines,
        exams,
        schedule: data.schedule.map(s => ({
          id: s.subjectId,
          time: s.time,
          subject: s.subjectName,
          room: s.room,
          note: s.teacherName,
        })),
      };
    } catch {
      return { deadlines, exams, schedule: mockSchedule };
    }
  }

  return { deadlines, exams, schedule: mockSchedule };
}
