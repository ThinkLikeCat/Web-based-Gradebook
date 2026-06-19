import { ValidationError } from '../errors/ValidationError';

export class LabSubmission {
  constructor(
    public readonly labId: string,
    public readonly studentId: string,
    public readonly submissionDate: string,
    public readonly fileUrl: string,
    public readonly teacherComment: string,
    public readonly teacherGrade: number | null,
    public readonly status: 'submitted' | 'pending' | 'graded',
  ) {
    if (!labId) throw new ValidationError('labId is required');
    if (!studentId) throw new ValidationError('studentId is required');
    if (!submissionDate) throw new ValidationError('submissionDate is required');
    if (!fileUrl) throw new ValidationError('fileUrl is required');
    if (!['submitted', 'pending', 'graded'].includes(status)) {
      throw new ValidationError('status must be submitted, pending or graded');
    }
  }
}
