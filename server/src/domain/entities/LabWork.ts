import { LabWorkId } from '../value-objects/LabWorkId';
import { ValidationError } from '../errors/ValidationError';

export type LabPartner = {
  id: string;
  name: string;
};

export class LabWork {
  constructor(
    public readonly id: LabWorkId,
    public readonly subjectId: string,
    public readonly title: string,
    public readonly issueDate: string,
    public readonly dueDate: string,
    public readonly teamWork: boolean,
    public readonly theoryMaterials: string,
    public readonly partners: LabPartner[] = [],
  ) {
    if (!subjectId) throw new ValidationError('subjectId is required');
    if (!title) throw new ValidationError('title is required');
    if (!issueDate) throw new ValidationError('issueDate is required');
    if (!dueDate) throw new ValidationError('dueDate is required');
  }
}
