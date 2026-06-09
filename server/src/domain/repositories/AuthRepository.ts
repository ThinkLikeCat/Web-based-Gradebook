import { User } from '../entities/User';

export interface CreateUserData {
  role: 'STUDENT' | 'TEACHER';
  fullName: string;
  lastName: string;
  passwordHash: string;
  birthDate?: string;
  groupId?: string;
  email?: string;
}

export interface AuthRepository {
  createUser(data: CreateUserData): Promise<User>;
  findUserById(id: number): Promise<User | null>;
  findUserByFullName(fullName: string): Promise<User | null>;
}
