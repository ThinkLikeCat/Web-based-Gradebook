import { StudentId } from '../value-objects/StudentId';

export class Student {
  constructor(
    public readonly id: StudentId,
    public readonly name: string,
    public readonly group: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Student name is required');
    }
    if (!group || group.trim().length === 0) {
      throw new Error('Student group is required');
    }
  }
}
