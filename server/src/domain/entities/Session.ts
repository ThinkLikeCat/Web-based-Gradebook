export class Session {
  constructor(
    public readonly refreshToken: string,
    public readonly userId: number,
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
  ) {}
}
