import { ValidationError } from '../errors/ValidationError';

export class Lesson {
  constructor(
    public readonly id: string,
    public readonly subjectId: string,
    public readonly groupId: string,
    public readonly date: string,
    public readonly startTime: string,
    public readonly endTime: string,
  ) {
    if (!id || id.trim().length === 0) throw new ValidationError('id is required');
    if (!subjectId || subjectId.trim().length === 0) throw new ValidationError('subjectId is required');
    if (!groupId || groupId.trim().length === 0) throw new ValidationError('groupId is required');
  }
}