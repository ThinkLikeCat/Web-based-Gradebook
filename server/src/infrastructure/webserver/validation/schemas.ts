import { z } from 'zod';

export const registerStudentSchema = z.object({
  lastName: z.string().min(1, 'lastName is required'),
  firstName: z.string().min(1, 'firstName is required'),
  birthDate: z.string().min(1, 'birthDate is required'),
  group: z.string().min(1, 'group is required'),
  password: z.string().min(4, 'password must be at least 4 characters'),
});

export const registerTeacherSchema = z.object({
  lastName: z.string().min(1, 'lastName is required'),
  firstName: z.string().min(1, 'firstName is required'),
  email: z.string().email('invalid email'),
  password: z.string().min(4, 'password must be at least 4 characters'),
});

export const loginSchema = z.object({
  fullName: z.string().min(1, 'fullName is required'),
  password: z.string().optional(),
  birthDate: z.string().optional(),
});

export const setGradeSchema = z.object({
  studentId: z.string().min(1),
  lessonId: z.string().min(1),
  value: z.number().int().min(1).max(10),
  type: z.string().min(1),
});

export const setAttendanceSchema = z.object({
  studentId: z.string().min(1),
  lessonId: z.string().min(1),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT']),
});

export const addLessonSchema = z.object({
  subjectId: z.string().min(1),
  groupId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export const addProgramItemSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['LAB', 'THEORY', 'PRACTICAL', 'CONTROL']),
  deadline: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
});

export const gradeSubmissionSchema = z.object({
  grade: z.number().int().min(1).max(10),
  comment: z.string().optional(),
});
