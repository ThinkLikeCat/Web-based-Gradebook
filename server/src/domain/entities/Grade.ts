import { ValidationError } from '../errors/ValidationError';

export class Grade {
  constructor(
    public readonly studentId: string,
    public readonly subjectId: string,
    public readonly value: number,
    public readonly type: string,
    public readonly date: string,
  ) {
    if (!studentId || studentId.trim().length === 0) throw new ValidationError('studentId is required');
    if (!subjectId || subjectId.trim().length === 0) throw new ValidationError('subjectId is required');
    if (value < 1 || value > 10) throw new ValidationError('Grade must be 1–10');
    if (!date || date.trim().length === 0) throw new ValidationError('date is required');
  }
}
