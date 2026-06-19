import { Pool } from 'pg';
import { AuthRepository, CreateUserData } from '../../../../domain/repositories/AuthRepository';
import { User } from '../../../../domain/entities/User';

export class PostgresAuthRepository implements AuthRepository {
  constructor(private readonly pool: Pool) {}

  async createUser(data: CreateUserData): Promise<User> {
    const result = await this.pool.query(
      `INSERT INTO users (role, full_name, password_hash, last_name, birth_date, group_id, email, student_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, role, full_name, password_hash, last_name, birth_date, group_id, email, student_id`,
      [data.role, data.fullName, data.passwordHash, data.lastName, data.birthDate ?? null, data.groupId ?? null, data.email ?? null, data.studentId ?? null],
    );
    const row = result.rows[0];
    return new User(row.id, row.role, row.full_name, row.password_hash, row.last_name, row.birth_date, row.group_id, row.email, row.student_id);
  }

  async findUserById(id: number): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT id, role, full_name, password_hash, last_name, birth_date, group_id, email, student_id FROM users WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return new User(r.id, r.role, r.full_name, r.password_hash, r.last_name, r.birth_date, r.group_id, r.email, r.student_id);
  }

  async findUserByFullName(fullName: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT id, role, full_name, password_hash, last_name, birth_date, group_id, email, student_id FROM users WHERE LOWER(full_name) = LOWER($1)',
      [fullName],
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return new User(r.id, r.role, r.full_name, r.password_hash, r.last_name, r.birth_date, r.group_id, r.email, r.student_id);
  }

  async resolveGroupName(groupId: string): Promise<string> {
    const result = await this.pool.query('SELECT name FROM groups_info WHERE id = $1', [groupId]);
    return result.rows[0]?.name || groupId;
  }
}
