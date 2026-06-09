import { User } from '../../../../src/domain/entities/User';

describe('User entity', () => {
  it('creates a student user', () => {
    const u = new User(1, 'STUDENT', 'Иванов Иван', 'hash', 'Иванов', '2000-01-01', 'group-1');
    expect(u.id).toBe(1);
    expect(u.role).toBe('STUDENT');
    expect(u.fullName).toBe('Иванов Иван');
    expect(u.lastName).toBe('Иванов');
    expect(u.birthDate).toBe('2000-01-01');
    expect(u.groupId).toBe('group-1');
    expect(u.email).toBeUndefined();
  });

  it('creates a teacher user', () => {
    const u = new User(2, 'TEACHER', 'Петрова Анна', 'hash', 'Петрова', undefined, undefined, 'anna@mail.com');
    expect(u.role).toBe('TEACHER');
    expect(u.email).toBe('anna@mail.com');
    expect(u.birthDate).toBeUndefined();
    expect(u.groupId).toBeUndefined();
  });

  it.each(['', ' '])('rejects empty fullName', (name) => {
    expect(() => new User(1, 'STUDENT', name, 'hash', 'Иванов')).toThrow('Full name is required');
  });

  it.each(['', ' '])('rejects empty lastName', (name) => {
    expect(() => new User(1, 'STUDENT', 'Иван Иванов', 'hash', name)).toThrow('Last name is required');
  });

  it('accepts ADMIN role', () => {
    const u = new User(3, 'ADMIN', 'Admin User', 'hash', 'Admin');
    expect(u.role).toBe('ADMIN');
  });
});
