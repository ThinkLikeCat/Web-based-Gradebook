import { groups } from '../data/mockData';
import studentAuth from '../data/studentAuth.json';
import teacherAuth from '../data/teacherAuth.json';
import type { TeacherChoice, User } from '../types';
import { apiRequest } from './client';

export type StudentLoginPayload = {
  lastName: string;
  birthDate: string;
  group: string;
};

export type TeacherLoginPayload = {
  lastName: string;
  password: string;
};

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function loginStudent(payload: StudentLoginPayload): Promise<User> {
  return apiRequest<User>('/auth/student', {
    method: 'POST',
    body: payload,
    mock: async () => {
      await delay();

      if (!payload.lastName.trim() || !payload.birthDate || !payload.group) {
        throw new Error('Заполните фамилию, дату рождения и группу');
      }

      const isValidStudent =
        normalize(payload.lastName) === normalize(studentAuth.lastName) &&
        payload.birthDate === studentAuth.birthDate &&
        payload.group === studentAuth.group;

      if (!isValidStudent) {
        throw new Error('Неверные данные');
      }

      return {
        id: studentAuth.id,
        role: 'student',
        lastName: studentAuth.lastName,
        fullName: studentAuth.fullName,
        group: studentAuth.group,
      };
    },
  });
}

export async function loginTeacher(payload: TeacherLoginPayload): Promise<User> {
  return apiRequest<User>('/auth/teacher', {
    method: 'POST',
    body: payload,
    mock: async () => {
      await delay();

      if (!payload.lastName.trim() || payload.password.length < 4) {
        throw new Error('Введите фамилию и пароль не короче 4 символов');
      }

      const isValidTeacher = normalize(payload.lastName) === normalize(teacherAuth.lastName) && payload.password === teacherAuth.password;

      if (!isValidTeacher) {
        throw new Error('Неверные данные');
      }

      return {
        id: teacherAuth.id,
        role: 'teacher',
        lastName: teacherAuth.lastName,
        fullName: teacherAuth.fullName,
      };
    },
  });
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
