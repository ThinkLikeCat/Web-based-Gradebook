import { deadlines, exams, schedule } from '../data/mockData';

export async function getDashboardData() {
  return {
    deadlines,
    exams,
    schedule,
  };
}
