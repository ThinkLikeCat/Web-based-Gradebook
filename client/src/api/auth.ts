import { groups } from '../data/mockData';
import studentAuth from '../data/studentAuth.json';
import teacherAuth from '../data/teacherAuth.json';
import type { AuthResponse, TeacherChoice, User } from '../types';
import { apiRequest, setTokens, clearTokens } from './client';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export type StudentLoginPayload = {
  lastName: string;
  firstName: string;
  birthDate: string;
  group: string;
  password: string;
};

export type TeacherLoginPayload = {
  lastName: string;
  firstName: string;
  password: string;
};

function mapBackendUser(data: AuthResponse): User {
  return {
    id: String(data.user.id),
    role: data.user.role === 'STUDENT' ? 'student' : 'teacher',
    fullName: data.user.fullName,
    lastName: data.user.fullName.split(' ')[0],
    group: data.user.group,
    studentId: data.user.studentId,
  };
}

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function loginStudent(payload: StudentLoginPayload): Promise<User> {
  if (!API_BASE_URL) {
    await delay();
    if (!payload.lastName.trim() || !payload.birthDate || !payload.group) {
      throw new Error('Заполните фамилию, дату рождения и группу');
    }
    const isValidStudent =
      normalize(payload.lastName) === normalize(studentAuth.lastName) &&
      payload.birthDate === studentAuth.birthDate &&
      payload.group === studentAuth.group;
    if (!isValidStudent) throw new Error('Неверные данные');
    return {
      id: studentAuth.id,
      role: 'student',
      lastName: studentAuth.lastName,
      fullName: studentAuth.fullName,
      group: studentAuth.group,
      studentId: studentAuth.id,
    };
  }

  const fullName = `${payload.lastName.trim()} ${payload.firstName.trim()}`;
  const data = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { fullName, password: payload.password },
  });
  setTokens({ token: data.token, refreshToken: data.refreshToken });
  return mapBackendUser(data);
}

export async function loginTeacher(payload: TeacherLoginPayload): Promise<User> {
  if (!API_BASE_URL) {
    await delay();
    if (!payload.lastName.trim() || payload.password.length < 4) {
      throw new Error('Введите фамилию и пароль не короче 4 символов');
    }
    const isValidTeacher = normalize(payload.lastName) === normalize(teacherAuth.lastName) && payload.password === teacherAuth.password;
    if (!isValidTeacher) throw new Error('Неверные данные');
    return {
      id: teacherAuth.id,
      role: 'teacher',
      lastName: teacherAuth.lastName,
      fullName: teacherAuth.fullName,
    };
  }

  const fullName = `${payload.lastName.trim()} ${payload.firstName.trim()}`;
  const data = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { fullName, password: payload.password },
  });
  setTokens({ token: data.token, refreshToken: data.refreshToken });
  return mapBackendUser(data);
}

export async function logoutUser(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
  clearTokens();
}

export async function getTeacherOptions(): Promise<{ groups: string[]; subjects: string[] }> {
  await delay(150);
  return {
    groups,
    subjects: ['Веб-программирование', 'Системы управления БД', 'Компьютерные сети', 'Тестирование ПО'],
  };
}

export function createTeacherChoice(group: string, subject: string): TeacherChoice {
  return { group, subject };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
