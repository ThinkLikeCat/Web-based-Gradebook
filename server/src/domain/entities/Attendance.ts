export type AttendanceStatus = 'present' | 'absent' | 'late';

export class Attendance {
  constructor(
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly date: string,
    public readonly status: AttendanceStatus,
  ) {
    if (!studentId || studentId.trim().length === 0) {
      throw new Error('Attendance studentId is required');
    }
    if (!subjectId || subjectId.trim().length === 0) {
      throw new Error('Attendance subjectId is required');
    }
    if (!date || date.trim().length === 0) {
      throw new Error('Attendance date is required');
    }
    if (!['present', 'absent', 'late'].includes(status)) {
      throw new Error('Attendance status is invalid');
    }
  }
}
