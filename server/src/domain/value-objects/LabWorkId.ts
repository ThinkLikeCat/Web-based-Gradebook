export class LabWorkId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('LabWorkId is required');
    }
  }
}
