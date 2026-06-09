import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { AuthUseCase, RegisterStudentDto, RegisterTeacherDto, LoginDto, AuthResultDto } from '../ports/in/auth.usecase';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { ValidationError } from '../../domain/errors/ValidationError';

export class AuthUseCaseImpl implements AuthUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async registerStudent(data: RegisterStudentDto): Promise<AuthResultDto> {
    if (!data.lastName || !data.firstName || !data.birthDate || !data.group || !data.password) {
      throw new ValidationError('lastName, firstName, birthDate, group и password обязательны');
    }

    const fullName = `${data.lastName} ${data.firstName}`;
    const existing = await this.repository.findUserByFullName(fullName);
    if (existing) {
      throw new ValidationError('Пользователь с таким именем уже существует');
    }

    const passwordHash = bcrypt.hashSync(data.password, 10);
    const user = await this.repository.createUser({
      role: 'STUDENT',
      fullName,
      lastName: data.lastName,
      passwordHash,
      birthDate: data.birthDate,
      groupId: data.group,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresInSeconds }
    );

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        groupId: user.groupId,
      },
    };
  }

  async registerTeacher(data: RegisterTeacherDto): Promise<AuthResultDto> {
    if (!data.lastName || !data.firstName || !data.email || !data.password) {
      throw new ValidationError('lastName, firstName, email и password обязательны');
    }

    const fullName = `${data.lastName} ${data.firstName}`;
    const existing = await this.repository.findUserByFullName(fullName);
    if (existing) {
      throw new ValidationError('Пользователь с таким именем уже существует');
    }

    const passwordHash = bcrypt.hashSync(data.password, 10);
    const user = await this.repository.createUser({
      role: 'TEACHER',
      fullName,
      lastName: data.lastName,
      passwordHash,
      email: data.email,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresInSeconds }
    );

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async login(data: LoginDto): Promise<AuthResultDto> {
    if (!data.fullName) {
      throw new ValidationError('fullName обязателен');
    }

    const user = await this.repository.findUserByFullName(data.fullName);
    if (!user) {
      throw new NotFoundError('Неверные данные');
    }

    if (!data.password || !bcrypt.compareSync(data.password, user.passwordHash)) {
      throw new NotFoundError('Неверные данные');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresInSeconds }
    );

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        groupId: user.groupId,
      },
    };
  }
}
