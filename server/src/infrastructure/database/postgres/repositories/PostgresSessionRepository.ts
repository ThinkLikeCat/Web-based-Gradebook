import { Pool } from 'pg';
import { SessionRepository } from '../../../../domain/repositories/SessionRepository';
import { Session } from '../../../../domain/entities/Session';

export class PostgresSessionRepository implements SessionRepository {
  constructor(private readonly pool: Pool) {}

  async createSession(userId: number, refreshToken: string, expiresAt: Date): Promise<Session> {
    await this.pool.query(
      'INSERT INTO sessions (refresh_token, user_id, expires_at) VALUES ($1, $2, $3)',
      [refreshToken, userId, expiresAt],
    );
    return new Session(refreshToken, userId, new Date(), expiresAt);
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
    const result = await this.pool.query(
      'SELECT refresh_token, user_id, created_at, expires_at FROM sessions WHERE refresh_token = $1',
      [refreshToken],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return new Session(r.refresh_token, r.user_id, r.created_at, r.expires_at);
  }

  async deleteSession(refreshToken: string): Promise<void> {
    await this.pool.query('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
  }

  async deleteAllUserSessions(userId: number): Promise<void> {
    await this.pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  }
}
