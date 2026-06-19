import { ValidationError } from '../errors/ValidationError';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export class User {
  constructor(
    public readonly id: number,
    public readonly role: UserRole,
    public readonly fullName: string,
    public readonly passwordHash: string,
    public readonly lastName: string,
    public readonly birthDate?: string,
    public readonly groupId?: string,
    public readonly email?: string,
    public readonly studentId?: string,
  ) {
    if (!fullName || fullName.trim().length === 0) {
      throw new ValidationError('Full name is required');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new ValidationError('Last name is required');
    }
  }
}
