import { CourseId } from '../value-objects/CourseId';

export type CourseScheduleItem = {
  day: string;
  time: string;
  room: string;
};

export class Course {
  constructor(
    public readonly id: CourseId,
    public readonly name: string,
    public readonly teacherName: string,
    public readonly schedule: CourseScheduleItem[],
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Course name is required');
    }
    if (!teacherName || teacherName.trim().length === 0) {
      throw new Error('Teacher name is required');
    }
    if (!schedule || schedule.length === 0) {
      throw new Error('Course schedule is required');
    }
  }
}
