export type GradeType = 'lab' | 'exam' | 'practice' | 'test' | 'oral';

export class Grade {
  constructor(
    public readonly subjectId: string,
    public readonly type: GradeType,
    public readonly value: number,
    public readonly date: string,
  ) {
    if (!subjectId || subjectId.trim().length === 0) {
      throw new Error('Grade subjectId is required');
    }
    if (value < 0 || value > 100) {
      throw new Error('Grade value must be between 0 and 100');
    }
    if (!date || date.trim().length === 0) {
      throw new Error('Grade date is required');
    }
  }
}
