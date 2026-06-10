import request from 'supertest';
import { createServer } from '../../src/infrastructure/webserver/server';
import { Express } from 'express';

let app: Express;
let studentToken: string;
let teacherToken: string;
let studentRefreshToken: string;
let teacherRefreshToken: string;

beforeAll(async () => {
  app = await createServer();
});

describe('Auth — public endpoints', () => {
  describe('POST /api/auth/register/student', () => {
    it('registers a new student', async () => {
      const res = await request(app)
        .post('/api/auth/register/student')
        .send({ lastName: 'Тестов', firstName: 'Студент', birthDate: '2000-01-01', group: 'Т-999', password: 'Test1234' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.role).toBe('STUDENT');
      expect(res.body.user.fullName).toBe('Тестов Студент');
    });

    it('rejects duplicate fullName', async () => {
      const res = await request(app)
        .post('/api/auth/register/student')
        .send({ lastName: 'Вольфович', firstName: 'Арсений', birthDate: '2007-11-08', group: 'Т-394', password: 'SomePass1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/уже существует/i);
    });

    it('rejects empty lastName', async () => {
      const res = await request(app)
        .post('/api/auth/register/student')
        .send({ lastName: '', firstName: 'X', birthDate: '2000-01-01', group: 'T-1', password: 'Pass1234' });

      expect(res.status).toBe(400);
    });

    it('rejects short password', async () => {
      const res = await request(app)
        .post('/api/auth/register/student')
        .send({ lastName: 'Короткий', firstName: 'Пароль', birthDate: '2000-01-01', group: 'T-1', password: 'ab' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/register/teacher', () => {
    it('registers a new teacher', async () => {
      const res = await request(app)
        .post('/api/auth/register/teacher')
        .send({ lastName: 'Тестов', firstName: 'Учитель', email: 'teacher@test.com', password: 'Teach1234' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.role).toBe('TEACHER');
    });

    it('rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register/teacher')
        .send({ lastName: 'Без', firstName: 'Почты', email: 'notanemail', password: 'Pass1234' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in student with correct password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ fullName: 'Вольфович Арсений', password: 'Student123$' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
      expect(res.body.user.role).toBe('STUDENT');
      studentToken = res.body.token;
      studentRefreshToken = res.body.refreshToken;
    });

    it('logs in teacher with correct password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ fullName: 'Вольфович Александр', password: 'Login123$' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
      expect(res.body.user.role).toBe('TEACHER');
      teacherToken = res.body.token;
      teacherRefreshToken = res.body.refreshToken;
    });

    it('rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ fullName: 'Вольфович Арсений', password: 'wrong' });

      expect(res.status).toBe(404);
    });

    it('rejects non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ fullName: 'No One', password: 'x' });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('issues new tokens with a valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: studentRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
      expect(res.body.refreshToken).not.toBe(studentRefreshToken);
      expect(res.body.user.role).toBe('STUDENT');

      studentToken = res.body.token;
      studentRefreshToken = res.body.refreshToken;
    });

    it('rejects an invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'non-existent-token' });

      expect(res.status).toBe(401);
    });

    it('rejects empty refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('logs out with a valid access token (single session)', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ refreshToken: teacherRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Выход выполнен');
    });

    it('rejects logout without auth', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'some-token' });

      expect(res.status).toBe(401);
    });
  });
});

describe('Teacher API — requires TEACHER role', () => {
  describe('GET /api/teacher/groups', () => {
    it('returns groups with valid teacher token', async () => {
      const res = await request(app)
        .get('/api/teacher/groups')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('groupId');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/teacher/groups');
      expect(res.status).toBe(401);
    });

    it('returns 403 with student token', async () => {
      const res = await request(app)
        .get('/api/teacher/groups')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/teacher/journal/:groupId/:subjectId', () => {
    it('returns journal for valid group and subject', async () => {
      const res = await request(app)
        .get('/api/teacher/journal/group-1/course-001')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('students');
      expect(res.body).toHaveProperty('lessons');
    });
  });

  describe('POST /api/teacher/lesson', () => {
    it('creates a lesson', async () => {
      const res = await request(app)
        .post('/api/teacher/lesson')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ subjectId: 'course-001', groupId: 'group-1', date: '2026-07-01', startTime: '09:00', endTime: '10:30' });

      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/teacher/grade', () => {
    it('saves a grade', async () => {
      const res = await request(app)
        .post('/api/teacher/grade')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentId: 'student-1', lessonId: 'lesson-1', value: 8, type: 'PRACTICAL' });

      expect(res.status).toBe(200);
    });

    it('rejects grade out of range', async () => {
      const res = await request(app)
        .post('/api/teacher/grade')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentId: 'student-1', lessonId: 'lesson-1', value: 11, type: 'PRACTICAL' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/teacher/attendance', () => {
    it('saves attendance', async () => {
      const res = await request(app)
        .post('/api/teacher/attendance')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentId: 'student-1', lessonId: 'lesson-1', status: 'LATE' });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/teacher/program', () => {
    it('creates a program item', async () => {
      const res = await request(app)
        .post('/api/teacher/program')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ subjectId: 'course-001', title: 'Новая работа', type: 'LAB', deadline: '2026-07-15' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('GET /api/teacher/program/:subjectId', () => {
    it('returns program items for a subject', async () => {
      const res = await request(app)
        .get('/api/teacher/program/course-001')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('DELETE /api/teacher/program/:itemId', () => {
    it('deletes a program item', async () => {
      const created = await request(app)
        .post('/api/teacher/program')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ subjectId: 'course-001', title: 'To delete', type: 'LAB' });

      const res = await request(app)
        .delete(`/api/teacher/program/${created.body.id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/teacher/labs/:programId/submissions', () => {
    it('returns submissions for a program', async () => {
      const res = await request(app)
        .get('/api/teacher/labs/program-1/submissions')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/teacher/labs/submissions/:submissionId/grade', () => {
    it('grades a submission', async () => {
      const res = await request(app)
        .post('/api/teacher/labs/submissions/submission-2/grade')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ grade: 9, comment: 'Отлично' });

      expect(res.status).toBe(200);
    });
  });
});

describe('Student API — requires STUDENT or TEACHER role', () => {
  describe('GET /api/students/:id/schedule', () => {
    it('returns schedule for student with student token', async () => {
      const res = await request(app)
        .get('/api/students/student-001/schedule')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('schedule');
      expect(res.body.schedule.length).toBeGreaterThan(0);
    });

    it('returns schedule with teacher token', async () => {
      const res = await request(app)
        .get('/api/students/student-001/schedule')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/students/student-001/schedule');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/students/:id/journal', () => {
    it('returns journal with grades and attendance', async () => {
      const res = await request(app)
        .get('/api/students/student-001/journal')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('grades');
      expect(res.body).toHaveProperty('attendance');
      expect(res.body.grades.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/students/:id/subjects/:subjectId', () => {
    it('returns subject progress', async () => {
      const res = await request(app)
        .get('/api/students/student-001/subjects/course-001')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
      expect(res.body.subjectName).toBe('Веб-программирование');
    });
  });

  describe('GET /api/students/:id/labs/:labId', () => {
    it('returns lab details', async () => {
      const res = await request(app)
        .get('/api/students/student-001/labs/lab-001')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('submissionStatus');
    });

    it('returns 404 for non-existent lab', async () => {
      const res = await request(app)
        .get('/api/students/student-001/labs/nonexistent')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });
  });
});
