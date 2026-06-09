export class TeacherGroup {
  constructor(
    public readonly teacherId: number,
    public readonly groupId: number,
    public readonly subjectId: number,
  ) {}
}