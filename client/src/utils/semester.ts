import type { Semester } from '../types';

export function createSemesterDateFilter(semester: Semester) {
  return (date: string) => {
    const month = new Date(date).getMonth();

    if (semester === 1) {
      return month >= 8 || month === 0;
    }

    return month >= 1 && month <= 5;
  };
}
