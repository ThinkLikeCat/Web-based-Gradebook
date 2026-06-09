export type ProgramType = 'LAB' | 'THEORY' | 'PRACTICAL' | 'CONTROL';

export class Program {
  constructor(
    public readonly id: number,
    public readonly subjectId: number,
    public readonly title: string,
    public readonly type: ProgramType,
    public readonly deadline?: Date,
    public readonly description?: string,
    public readonly fileUrl?: string,
  ) {}
}