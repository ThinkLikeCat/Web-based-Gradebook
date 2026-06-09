import { StudentId } from '../value-objects/StudentId';
import { ValidationError } from '../errors/ValidationError';

export class Student {
  constructor(
    public readonly id: StudentId,
    public readonly name: string,
    public readonly group: string,
  ) {
    if (!name) throw new ValidationError('Student name is required');
    if (!group) throw new ValidationError('Student group is required');
  }
}
