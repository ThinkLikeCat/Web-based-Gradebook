import bcrypt from 'bcryptjs';
import { AuthUseCaseImpl } from '../../../../src/application/usecases/auth.usecase';
import { AuthRepository } from '../../../../src/domain/repositories/AuthRepository';
import { User } from '../../../../src/domain/entities/User';
import { ValidationError } from '../../../../src/domain/errors/ValidationError';

describe('AuthUseCase', () => {
  let mockRepo: jest.Mocked<AuthRepository>;
  let useCase: AuthUseCaseImpl;

  beforeEach(() => {
    mockRepo = {
      createUser: jest.fn(),
      findUserById: jest.fn(),
      findUserByFullName: jest.fn(),
    };
    useCase = new AuthUseCaseImpl(mockRepo);
  });

  describe('registerStudent', () => {
    const studentData = {
      lastName: 'Иванов',
      firstName: 'Иван',
      birthDate: '2000-01-01',
      group: 'Т-394',
      password: 'Secret123',
    };

    it('creates a student user and returns token', async () => {
      mockRepo.findUserByFullName.mockResolvedValue(null);
      mockRepo.createUser.mockImplementation(async (data) =>
        new User(10, 'STUDENT', data.fullName, data.passwordHash, data.lastName, data.birthDate, data.groupId),
      );

      const result = await useCase.registerStudent(studentData);

      expect(result.user.role).toBe('STUDENT');
      expect(result.user.fullName).toBe('Иванов Иван');
      expect(result.user.id).toBe(10);
      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe('string');
      expect(mockRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'STUDENT', lastName: 'Иванов', groupId: 'Т-394' }),
      );
    });

    it('throws if user already exists', async () => {
      mockRepo.findUserByFullName.mockResolvedValue(
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
      mockRepo.findUserByFullName.mockResolvedValue(null);
      mockRepo.createUser.mockImplementation(async (data) =>
        new User(1, 'STUDENT', data.fullName, data.passwordHash, data.lastName),
      );

      await useCase.registerStudent(studentData);

      const created = mockRepo.createUser.mock.calls[0][0];
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

    it('creates a teacher user and returns token', async () => {
      mockRepo.findUserByFullName.mockResolvedValue(null);
      mockRepo.createUser.mockImplementation(async (data) =>
        new User(20, 'TEACHER', data.fullName, data.passwordHash, data.lastName, undefined, undefined, data.email),
      );

      const result = await useCase.registerTeacher(teacherData);

      expect(result.user.role).toBe('TEACHER');
      expect(result.user.fullName).toBe('Петров Пётр');
      expect(mockRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'TEACHER', email: 'petr@mail.com' }),
      );
    });

    it('throws if email is empty', async () => {
      await expect(useCase.registerTeacher({ ...teacherData, email: '' })).rejects.toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('logs in student with correct password', async () => {
      const hash = bcrypt.hashSync('StudentPass1', 10);
      mockRepo.findUserByFullName.mockResolvedValue(
        new User(1, 'STUDENT', 'Иванов Иван', hash, 'Иванов', '2000-01-01', 'group-1'),
      );

      const result = await useCase.login({ fullName: 'Иванов Иван', password: 'StudentPass1' });

      expect(result.user.role).toBe('STUDENT');
      expect(result.token).toBeTruthy();
    });

    it('logs in teacher with correct password', async () => {
      const hash = bcrypt.hashSync('TeacherPass1', 10);
      mockRepo.findUserByFullName.mockResolvedValue(
        new User(2, 'TEACHER', 'Петров Пётр', hash, 'Петров', undefined, undefined, 'petr@mail.com'),
      );

      const result = await useCase.login({ fullName: 'Петров Пётр', password: 'TeacherPass1' });

      expect(result.user.role).toBe('TEACHER');
      expect(result.token).toBeTruthy();
    });

    it('rejects wrong password', async () => {
      const hash = bcrypt.hashSync('CorrectPass', 10);
      mockRepo.findUserByFullName.mockResolvedValue(
        new User(1, 'STUDENT', 'Иванов Иван', hash, 'Иванов'),
      );

      await expect(useCase.login({ fullName: 'Иванов Иван', password: 'WrongPass' })).rejects.toThrow('Неверные данные');
    });

    it('rejects non-existent user', async () => {
      mockRepo.findUserByFullName.mockResolvedValue(null);

      await expect(useCase.login({ fullName: 'No One', password: 'x' })).rejects.toThrow('Неверные данные');
    });

    it('rejects empty fullName', async () => {
      await expect(useCase.login({ fullName: '', password: 'x' })).rejects.toThrow(ValidationError);
    });
  });
});
