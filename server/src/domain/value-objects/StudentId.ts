export class StudentId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('StudentId is required');
    }
  }
}
