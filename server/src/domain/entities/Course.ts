import { CourseId } from '../value-objects/CourseId';
import { ValidationError } from '../errors/ValidationError';

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
    if (!name) throw new ValidationError('Course name is required');
    if (!teacherName) throw new ValidationError('Teacher name is required');
    if (!schedule || schedule.length === 0) throw new ValidationError('Course schedule is required');
  }
}
