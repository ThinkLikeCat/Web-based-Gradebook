export class Lesson {
  constructor(
    public readonly id: number,
    public readonly subjectId: number,
    public readonly groupId: number,
    public readonly date: Date,
    public readonly startTime: Date,
    public readonly endTime: Date,
  ) {}
}