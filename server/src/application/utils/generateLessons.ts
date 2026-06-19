import { CourseScheduleItem } from '../../domain/repositories/TeacherJournalRepository';
import { CreateLessonData } from '../../domain/repositories/TeacherJournalRepository';

const DAY_NAME_TO_JS: Record<string, number> = {
  'Воскресенье': 0,
  'Понедельник': 1,
  'Вторник': 2,
  'Среда': 3,
  'Четверг': 4,
  'Пятница': 5,
  'Суббота': 6,
};

export function generateDateStrings(
  schedule: CourseScheduleItem[],
  start: Date,
  end: Date,
): string[] {
  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    const jsDay = current.getDay();
    const dateStr = formatDate(current);

    for (const item of schedule) {
      const scheduleDay = DAY_NAME_TO_JS[item.day];
      if (scheduleDay !== undefined && scheduleDay === jsDay) {
        dates.push(dateStr);
        break;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function generateLessonDates(
  schedule: CourseScheduleItem[],
  subjectId: string,
  groupId: string,
  existingDates: Set<string>,
  start: Date,
  end: Date,
): CreateLessonData[] {
  const result: CreateLessonData[] = [];
  const current = new Date(start);

  while (current <= end) {
    const jsDay = current.getDay();
    const dateStr = formatDate(current);

    for (const item of schedule) {
      const scheduleDay = DAY_NAME_TO_JS[item.day];
      if (scheduleDay !== undefined && scheduleDay === jsDay) {
        if (!existingDates.has(dateStr)) {
          const [startTime, endTime] = item.time.split('-');
          result.push({ subjectId, groupId, date: dateStr, startTime, endTime });
        }
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return result;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
