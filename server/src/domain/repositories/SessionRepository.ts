import { Session } from '../entities/Session';

export interface SessionRepository {
  createSession(userId: number, refreshToken: string, expiresAt: Date): Promise<Session>;
  findSessionByRefreshToken(refreshToken: string): Promise<Session | null>;
  deleteSession(refreshToken: string): Promise<void>;
  deleteAllUserSessions(userId: number): Promise<void>;
}
