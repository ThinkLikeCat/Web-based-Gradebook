import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { AuthUseCase, RegisterStudentDto, RegisterTeacherDto, LoginDto, AuthResultDto, RefreshTokenDto } from '../ports/in/auth.usecase';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { ValidationError } from '../../domain/errors/ValidationError';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';

function generateAccessToken(userId: number, role: string, studentId?: string): string {
  return jwt.sign(
    { id: userId, role, studentId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresInSeconds }
  );
}

function generateRefreshToken(): string {
  return crypto.randomUUID();
}

export class AuthUseCaseImpl implements AuthUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  private async buildAuthResult(userId: number, role: string, fullName: string, groupId?: string, studentId?: string): Promise<AuthResultDto> {
    const token = generateAccessToken(userId, role, studentId);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + config.refreshTokenExpiresInSeconds * 1000);
    await this.sessionRepository.createSession(userId, refreshToken, expiresAt);

    const group = groupId ? await this.authRepository.resolveGroupName(groupId) : undefined;

    return {
      token,
      refreshToken,
      user: { id: userId, fullName, role, group, groupId, studentId },
    };
  }

  async registerStudent(data: RegisterStudentDto): Promise<AuthResultDto> {
    if (!data.lastName?.trim() || !data.firstName?.trim() || !data.birthDate?.trim() || !data.group?.trim() || !data.password?.trim()) {
      throw new ValidationError('lastName, firstName, birthDate, group и password обязательны');
    }
    if (data.password.trim().length < 4) {
      throw new ValidationError('Пароль должен содержать минимум 4 символа');
    }

    const fullName = `${data.lastName.trim()} ${data.firstName.trim()}`;
    const existing = await this.authRepository.findUserByFullName(fullName);
    if (existing) {
      throw new ValidationError('Пользователь с таким именем уже существует');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const studentId = crypto.randomUUID();
    const user = await this.authRepository.createUser({
      role: 'STUDENT',
      fullName,
      lastName: data.lastName,
      passwordHash,
      birthDate: data.birthDate,
      groupId: data.group,
      studentId,
    });

    return this.buildAuthResult(user.id, user.role, user.fullName, user.groupId, user.studentId);
  }

  async registerTeacher(data: RegisterTeacherDto): Promise<AuthResultDto> {
    if (!data.lastName?.trim() || !data.firstName?.trim() || !data.email?.trim() || !data.password?.trim()) {
      throw new ValidationError('lastName, firstName, email и password обязательны');
    }
    if (data.password.trim().length < 4) {
      throw new ValidationError('Пароль должен содержать минимум 4 символа');
    }

    const fullName = `${data.lastName.trim()} ${data.firstName.trim()}`;
    const existing = await this.authRepository.findUserByFullName(fullName);
    if (existing) {
      throw new ValidationError('Пользователь с таким именем уже существует');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.authRepository.createUser({
      role: 'TEACHER',
      fullName,
      lastName: data.lastName,
      passwordHash,
      email: data.email,
    });

    return this.buildAuthResult(user.id, user.role, user.fullName);
  }

  async login(data: LoginDto): Promise<AuthResultDto> {
    if (!data.fullName?.trim()) {
      throw new ValidationError('fullName обязателен');
    }

    const user = await this.authRepository.findUserByFullName(data.fullName);
    if (!user) {
      throw new NotFoundError('Неверные данные');
    }

    if (!data.password || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new NotFoundError('Неверные данные');
    }

    return this.buildAuthResult(user.id, user.role, user.fullName, user.groupId, user.studentId);
  }

  async refreshToken(data: RefreshTokenDto): Promise<AuthResultDto> {
    if (!data.refreshToken?.trim()) {
      throw new ValidationError('refreshToken обязателен');
    }

    const session = await this.sessionRepository.findSessionByRefreshToken(data.refreshToken);
    if (!session) {
      throw new UnauthorizedError('Неверный refresh-токен');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deleteSession(data.refreshToken);
      throw new UnauthorizedError('Refresh-токен истёк');
    }

    const user = await this.authRepository.findUserById(session.userId);
    if (!user) {
      await this.sessionRepository.deleteSession(data.refreshToken);
      throw new NotFoundError('Пользователь не найден');
    }

    await this.sessionRepository.deleteSession(data.refreshToken);

    return this.buildAuthResult(user.id, user.role, user.fullName, user.groupId, user.studentId);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.sessionRepository.deleteSession(refreshToken);
  }

  async logoutAll(userId: number): Promise<void> {
    await this.sessionRepository.deleteAllUserSessions(userId);
  }
}
