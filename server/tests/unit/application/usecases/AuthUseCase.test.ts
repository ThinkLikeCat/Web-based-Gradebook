import bcrypt from 'bcryptjs';
import { AuthUseCaseImpl } from '../../../../src/application/usecases/auth.usecase';
import { AuthRepository } from '../../../../src/domain/repositories/AuthRepository';
import { SessionRepository } from '../../../../src/domain/repositories/SessionRepository';
import { User } from '../../../../src/domain/entities/User';
import { Session } from '../../../../src/domain/entities/Session';
import { ValidationError } from '../../../../src/domain/errors/ValidationError';
import { UnauthorizedError } from '../../../../src/domain/errors/UnauthorizedError';

describe('AuthUseCase', () => {
  let mockAuthRepo: jest.Mocked<AuthRepository>;
  let mockSessionRepo: jest.Mocked<SessionRepository>;
  let useCase: AuthUseCaseImpl;

  beforeEach(() => {
    mockAuthRepo = {
      createUser: jest.fn(),
      findUserById: jest.fn(),
      findUserByFullName: jest.fn(),
      resolveGroupName: jest.fn().mockResolvedValue('Т-394'),
    };
    mockSessionRepo = {
      createSession: jest.fn(),
      findSessionByRefreshToken: jest.fn(),
      deleteSession: jest.fn(),
      deleteAllUserSessions: jest.fn(),
    };
    useCase = new AuthUseCaseImpl(mockAuthRepo, mockSessionRepo);
  });

  describe('registerStudent', () => {
    const studentData = {
      lastName: 'Иванов',
      firstName: 'Иван',
      birthDate: '2000-01-01',
      group: 'Т-394',
      password: 'Secret123',
    };

    it('creates a student user and returns token + refreshToken', async () => {
      mockAuthRepo.findUserByFullName.mockResolvedValue(null);
      mockAuthRepo.createUser.mockImplementation(async (data) =>
        new User(10, 'STUDENT', data.fullName, data.passwordHash, data.lastName, data.birthDate, data.groupId),
      );

      const result = await useCase.registerStudent(studentData);

      expect(result.user.role).toBe('STUDENT');
      expect(result.user.fullName).toBe('Иванов Иван');
      expect(result.user.id).toBe(10);
      expect(result.token).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(typeof result.token).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'STUDENT', lastName: 'Иванов', groupId: 'Т-394' }),
      );
      expect(mockSessionRepo.createSession).toHaveBeenCalledWith(10, result.refreshToken, expect.any(Date));
    });

    it('throws if user already exists', async () => {
      mockAuthRepo.findUserByFullName.mockResolvedValue(
        new User(1, 'STUDENT', 'Иванов Иван', 'hash', 'Иванов'),
      );

      await expect(useCase.registerStudent(studentData)).rejects.toThrow(ValidationError);
    });

    it.each(['', ' '])('throws if lastName is empty', async (v) => {
      await expect(useCase.registerStudent({ ...studentData, lastName: v })).rejects.toThrow(ValidationError);
    });

    it('throws if password is too short', async () => {
      await expect(useCase.registerStudent({ ...studentData, password: 'ab' })).rejects.toThrow(ValidationError);
    });

    it('hashes the password', async () => {
      mockAuthRepo.findUserByFullName.mockResolvedValue(null);
      mockAuthRepo.createUser.mockImplementation(async (data) =>
        new User(1, 'STUDENT', data.fullName, data.passwordHash, data.lastName),
      );

      await useCase.registerStudent(studentData);

      const created = mockAuthRepo.createUser.mock.calls[0][0];
      expect(created.passwordHash).not.toBe('Secret123');
      expect(bcrypt.compareSync('Secret123', created.passwordHash)).toBe(true);
    });
  });

  describe('registerTeacher', () => {
    const teacherData = {
      lastName: 'Петров',
      firstName: 'Пётр',
      email: 'petr@mail.com',
      password: 'StrongPass1',
    };

    it('creates a teacher user and returns token + refreshToken', async () => {
      mockAuthRepo.findUserByFullName.mockResolvedValue(null);
      mockAuthRepo.createUser.mockImplementation(async (data) =>
        new User(20, 'TEACHER', data.fullName, data.passwordHash, data.lastName, undefined, undefined, data.email),
      );

      const result = await useCase.registerTeacher(teacherData);

      expect(result.user.role).toBe('TEACHER');
      expect(result.user.fullName).toBe('Петров Пётр');
      expect(result.refreshToken).toBeTruthy();
      expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'TEACHER', email: 'petr@mail.com' }),
      );
      expect(mockSessionRepo.createSession).toHaveBeenCalledWith(20, result.refreshToken, expect.any(Date));
    });

    it('throws if email is empty', async () => {
      await expect(useCase.registerTeacher({ ...teacherData, email: '' })).rejects.toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('logs in student with correct password and returns refreshToken', async () => {
      const hash = bcrypt.hashSync('StudentPass1', 10);
      mockAuthRepo.findUserByFullName.mockResolvedValue(
        new User(1, 'STUDENT', 'Иванов Иван', hash, 'Иванов', '2000-01-01', 'group-1'),
      );

      const result = await useCase.login({ fullName: 'Иванов Иван', password: 'StudentPass1' });

      expect(result.user.role).toBe('STUDENT');
      expect(result.token).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(mockSessionRepo.createSession).toHaveBeenCalledWith(1, result.refreshToken, expect.any(Date));
    });

    it('logs in teacher with correct password', async () => {
      const hash = bcrypt.hashSync('TeacherPass1', 10);
      mockAuthRepo.findUserByFullName.mockResolvedValue(
        new User(2, 'TEACHER', 'Петров Пётр', hash, 'Петров', undefined, undefined, 'petr@mail.com'),
      );

      const result = await useCase.login({ fullName: 'Петров Пётр', password: 'TeacherPass1' });

      expect(result.user.role).toBe('TEACHER');
      expect(result.token).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('rejects wrong password', async () => {
      const hash = bcrypt.hashSync('CorrectPass', 10);
      mockAuthRepo.findUserByFullName.mockResolvedValue(
        new User(1, 'STUDENT', 'Иванов Иван', hash, 'Иванов'),
      );

      await expect(useCase.login({ fullName: 'Иванов Иван', password: 'WrongPass' })).rejects.toThrow('Неверные данные');
    });

    it('rejects non-existent user', async () => {
      mockAuthRepo.findUserByFullName.mockResolvedValue(null);

      await expect(useCase.login({ fullName: 'No One', password: 'x' })).rejects.toThrow('Неверные данные');
    });

    it('rejects empty fullName', async () => {
      await expect(useCase.login({ fullName: '', password: 'x' })).rejects.toThrow(ValidationError);
    });
  });

  describe('refreshToken', () => {
    it('issues new tokens for a valid refresh token', async () => {
      const future = new Date(Date.now() + 3600000);
      mockSessionRepo.findSessionByRefreshToken.mockResolvedValue(
        new Session('valid-refresh', 1, new Date(), future),
      );
      mockAuthRepo.findUserById.mockResolvedValue(
        new User(1, 'STUDENT', 'Иванов Иван', 'hash', 'Иванов', '2000-01-01', 'group-1'),
      );

      const result = await useCase.refreshToken({ refreshToken: 'valid-refresh' });

      expect(result.token).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.refreshToken).not.toBe('valid-refresh');
      expect(mockSessionRepo.deleteSession).toHaveBeenCalledWith('valid-refresh');
      expect(mockSessionRepo.createSession).toHaveBeenCalledWith(1, result.refreshToken, expect.any(Date));
    });

    it('rejects an invalid refresh token', async () => {
      mockSessionRepo.findSessionByRefreshToken.mockResolvedValue(null);

      await expect(useCase.refreshToken({ refreshToken: 'invalid' })).rejects.toThrow(UnauthorizedError);
    });

    it('rejects an expired refresh token', async () => {
      const past = new Date(Date.now() - 3600000);
      mockSessionRepo.findSessionByRefreshToken.mockResolvedValue(
        new Session('expired', 1, new Date(), past),
      );

      await expect(useCase.refreshToken({ refreshToken: 'expired' })).rejects.toThrow(UnauthorizedError);
      expect(mockSessionRepo.deleteSession).toHaveBeenCalledWith('expired');
    });

    it('rejects if user no longer exists', async () => {
      const future = new Date(Date.now() + 3600000);
      mockSessionRepo.findSessionByRefreshToken.mockResolvedValue(
        new Session('orphaned', 999, new Date(), future),
      );
      mockAuthRepo.findUserById.mockResolvedValue(null);

      await expect(useCase.refreshToken({ refreshToken: 'orphaned' })).rejects.toThrow('Пользователь не найден');
      expect(mockSessionRepo.deleteSession).toHaveBeenCalledWith('orphaned');
    });

    it('rejects empty refreshToken', async () => {
      await expect(useCase.refreshToken({ refreshToken: '' })).rejects.toThrow(ValidationError);
    });
  });

  describe('logout', () => {
    it('deletes the session by refresh token', async () => {
      await useCase.logout('some-refresh-token');
      expect(mockSessionRepo.deleteSession).toHaveBeenCalledWith('some-refresh-token');
    });
  });

  describe('logoutAll', () => {
    it('deletes all sessions for a user', async () => {
      await useCase.logoutAll(1);
      expect(mockSessionRepo.deleteAllUserSessions).toHaveBeenCalledWith(1);
    });
  });
});
