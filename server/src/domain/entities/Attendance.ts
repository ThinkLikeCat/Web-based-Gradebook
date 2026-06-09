import { ValidationError } from '../errors/ValidationError';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export class Attendance {
  constructor(
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly date: string,
    public readonly status: AttendanceStatus,
  ) {
    if (!studentId) throw new ValidationError('studentId is required');
    if (!subjectId) throw new ValidationError('subjectId is required');
    if (!date) throw new ValidationError('date is required');
    if (!['PRESENT', 'LATE', 'ABSENT'].includes(status)) {
      throw new ValidationError('status must be PRESENT, LATE or ABSENT');
    }
  }
}
