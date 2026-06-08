export class CourseId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('CourseId is required');
    }
  }
}
