import { LabWorkId } from '../value-objects/LabWorkId';

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
    if (!subjectId || subjectId.trim().length === 0) {
      throw new Error('LabWork subjectId is required');
    }
    if (!title || title.trim().length === 0) {
      throw new Error('LabWork title is required');
    }
    if (!issueDate || issueDate.trim().length === 0) {
      throw new Error('LabWork issueDate is required');
    }
    if (!dueDate || dueDate.trim().length === 0) {
      throw new Error('LabWork dueDate is required');
    }
  }
}
