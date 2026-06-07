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
    if (!labId || labId.trim().length === 0) {
      throw new Error('LabSubmission labId is required');
    }
    if (!studentId || studentId.trim().length === 0) {
      throw new Error('LabSubmission studentId is required');
    }
    if (!submissionDate || submissionDate.trim().length === 0) {
      throw new Error('LabSubmission submissionDate is required');
    }
    if (!fileUrl || fileUrl.trim().length === 0) {
      throw new Error('LabSubmission fileUrl is required');
    }
    if (!['submitted', 'pending', 'graded'].includes(status)) {
      throw new Error('LabSubmission status is invalid');
    }
  }
}
