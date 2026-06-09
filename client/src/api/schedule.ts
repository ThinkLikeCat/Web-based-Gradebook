import { deadlines, exams, schedule } from '../data/mockData';
import { apiRequest } from './client';

export async function getDashboardData() {
  return apiRequest('/dashboard', {
    mock: () => ({
      deadlines,
      exams,
      schedule,
    }),
  });
}
