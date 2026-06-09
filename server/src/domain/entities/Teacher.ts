export class Teacher {
  constructor(
    public readonly id: number,
    public readonly fullName: string,
    public readonly email: string,
    public readonly passwordHash: string,
  ) {
    if (!fullName || fullName.trim().length === 0) {
      throw new Error('Teacher name is required');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required');
    }
  }
}