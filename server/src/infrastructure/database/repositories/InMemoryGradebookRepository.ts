import { Student } from '../../../domain/entities/Student';
import { Course } from '../../../domain/entities/Course';
import { Grade } from '../../../domain/entities/Grade';
import { Attendance } from '../../../domain/entities/Attendance';
import { LabWork } from '../../../domain/entities/LabWork';
import { LabSubmission } from '../../../domain/entities/LabSubmission';
import { User } from '../../../domain/entities/User';
import { Session } from '../../../domain/entities/Session';
import { StudentId } from '../../../domain/value-objects/StudentId';
import { CourseId } from '../../../domain/value-objects/CourseId';
import { LabWorkId } from '../../../domain/value-objects/LabWorkId';
import { ProgramItemData, LabSubmissionData } from '../../../domain/repositories/TeacherProgramRepository';
import { TeacherGroupInfo } from '../../../domain/repositories/TeacherAccessRepository';
import { CreateUserData } from '../../../domain/repositories/AuthRepository';
import { SessionRepository } from '../../../domain/repositories/SessionRepository';
import { TeacherGroupData, TeacherSubjectData, TeacherStudentData } from '../../../domain/repositories/TeacherAccessRepository';
import { TeacherLessonData, TeacherGradeData, TeacherAttendanceData, CreateLessonData, SaveGradeData, SaveAttendanceData } from '../../../domain/repositories/TeacherJournalRepository';
import { AuthRepository } from '../../../domain/repositories/AuthRepository';
import { StudentReadRepository } from '../../../domain/repositories/StudentReadRepository';
import { TeacherAccessRepository } from '../../../domain/repositories/TeacherAccessRepository';
import { TeacherJournalRepository } from '../../../domain/repositories/TeacherJournalRepository';
import { TeacherProgramRepository } from '../../../domain/repositories/TeacherProgramRepository';

import bcrypt from 'bcryptjs';

export class InMemoryGradebookRepository implements
  AuthRepository,
  SessionRepository,
  StudentReadRepository,
  TeacherAccessRepository,
  TeacherJournalRepository,
  TeacherProgramRepository {

  private nextUserId = 3;
  private nextStudentId = 5;
  private sessions: Session[] = [];
  private users: User[] = [
    new User(1, 'STUDENT', 'Вольфович Арсений', bcrypt.hashSync('Student123$', 10), 'Вольфович', '2007-11-08', 'group-1', undefined, 'student-001'),
    new User(2, 'TEACHER', 'Вольфович Александр', bcrypt.hashSync('Login123$', 10), 'Вольфович', undefined, undefined, 'teacher@mail.com'),
  ];
  private students: Student[] = [
    new Student(new StudentId('student-001'), 'Вольфович Арсений', 'Т-394'),
    new Student(new StudentId('student-002'), 'Иванов Иван', 'Т-394'),
    new Student(new StudentId('student-003'), 'Петров Петр', 'Т-394'),
    new Student(new StudentId('student-004'), 'Сидорова Анна', 'Т-395'),
  ];
  private studentCourses: { studentId: string; courseId: string }[] = [
    { studentId: 'student-001', courseId: 'course-001' },
    { studentId: 'student-001', courseId: 'course-002' },
    { studentId: 'student-002', courseId: 'course-001' },
  ];
  private courses: Course[] = [
    new Course(new CourseId('course-001'), 'Веб-программирование', 'Вольфович Александр', [
      { day: 'Понедельник', time: '09:00-10:30', room: 'Ауд. 214' },
      { day: 'Среда', time: '11:00-12:30', room: 'Ауд. 214' },
    ]),
    new Course(new CourseId('course-002'), 'Системы управления БД', 'Преп. Сидоров', [
      { day: 'Вторник', time: '10:00-11:30', room: 'Ауд. 305' },
    ]),
    new Course(new CourseId('course-003'), 'Компьютерные сети', 'Преп. Петров', [
      { day: 'Четверг', time: '09:00-10:30', room: 'Ауд. 401' },
    ]),
    new Course(new CourseId('course-004'), 'Тестирование ПО', 'Преп. Иванова', [
      { day: 'Пятница', time: '14:00-15:20', room: 'Ауд. 219' },
    ]),
  ];
  private studentGrades: Grade[] = [
    new Grade('student-001', 'course-001', 8, 'lab', '2026-05-15'),
    new Grade('student-001', 'course-001', 9, 'test', '2026-05-20'),
    new Grade('student-001', 'course-002', 8, 'exam', '2026-05-18'),
  ];
  private studentAttendance: Attendance[] = [
    new Attendance('student-001', 'course-001', '2026-05-12', 'PRESENT'),
    new Attendance('student-001', 'course-001', '2026-05-19', 'LATE'),
    new Attendance('student-001', 'course-002', '2026-05-13', 'ABSENT'),
  ];
  private labs: LabWork[] = [
    new LabWork(new LabWorkId('lab-001'), 'course-001', 'Лабораторная работа 1', '2026-05-01', '2026-05-10', false, 'Теоретические материалы по линейной алгебре', []),
    new LabWork(new LabWorkId('lab-002'), 'course-002', 'Лабораторная работа 2', '2026-05-05', '2026-05-14', true, 'Теория электростатики', [
      { id: 'student-002', name: 'Пётр Петров' },
    ]),
  ];
  private labSubmissions: LabSubmission[] = [
    new LabSubmission('lab-001', 'student-001', '2026-05-09', '/files/lab-001-solution.pdf', 'Хорошая работа, нужны исправления по пункту 3', 88, 'graded'),
    new LabSubmission('lab-002', 'student-001', '2026-05-13', '/files/lab-002-solution.pdf', 'Ждём отчёт о работе команды', null, 'submitted'),
  ];
  private groups: TeacherGroupData[] = [
    { id: 'group-1', name: 'Т-394' },
    { id: 'group-2', name: 'Т-395' },
  ];
  private subjects: TeacherSubjectData[] = [
    { id: 'course-001', name: 'Веб-программирование' },
    { id: 'course-002', name: 'Системы управления БД' },
    { id: 'course-003', name: 'Компьютерные сети' },
    { id: 'course-004', name: 'Тестирование ПО' },
  ];
  private teacherStudents: TeacherStudentData[] = [
    { id: 'student-001', fullName: 'Вольфович Арсений', groupId: 'group-1', isExpelled: false, isNew: false },
    { id: 'student-002', fullName: 'Иванов Иван', groupId: 'group-1', isExpelled: false, isNew: true },
    { id: 'student-003', fullName: 'Петров Петр', groupId: 'group-1', isExpelled: true, isNew: false },
    { id: 'student-004', fullName: 'Сидорова Анна', groupId: 'group-2', isExpelled: false, isNew: false },
  ];
  private teacherGroups: { teacherId: number; groupId: string; subjectId: string }[] = [
    { teacherId: 2, groupId: 'group-1', subjectId: 'course-001' },
    { teacherId: 2, groupId: 'group-1', subjectId: 'course-002' },
    { teacherId: 2, groupId: 'group-2', subjectId: 'course-001' },
  ];
  private lessons: TeacherLessonData[] = [
    { id: 'lesson-1', subjectId: 'course-001', groupId: 'group-1', date: '2026-06-01', startTime: '09:00', endTime: '10:30' },
    { id: 'lesson-2', subjectId: 'course-001', groupId: 'group-1', date: '2026-06-08', startTime: '09:00', endTime: '10:30' },
    { id: 'lesson-3', subjectId: 'course-002', groupId: 'group-1', date: '2026-06-08', startTime: '11:00', endTime: '12:30' },
  ];
  private teacherGradesRecords: TeacherGradeData[] = [
    { studentId: 'student-001', lessonId: 'lesson-1', value: 5, type: 'PRACTICAL' },
    { studentId: 'student-002', lessonId: 'lesson-1', value: 4, type: 'PRACTICAL' },
  ];
  private teacherAttendanceRecords: TeacherAttendanceData[] = [
    { studentId: 'student-001', lessonId: 'lesson-1', status: 'PRESENT' },
    { studentId: 'student-002', lessonId: 'lesson-1', status: 'LATE' },
    { studentId: 'student-003', lessonId: 'lesson-1', status: 'ABSENT' },
  ];
  private programs: ProgramItemData[] = [
    { id: 'program-1', subjectId: 'course-001', title: 'Лабораторная работа №1', type: 'LAB', deadline: '2026-06-15', description: 'React Router и API', fileUrl: undefined },
    { id: 'program-2', subjectId: 'course-001', title: 'Контрольная работа', type: 'CONTROL', deadline: '2026-06-20', description: 'Итоговая контрольная', fileUrl: undefined },
    { id: 'program-3', subjectId: 'course-002', title: 'Лабораторная работа по БД', type: 'LAB', deadline: '2026-06-18', description: 'SQL запросы', fileUrl: undefined },
  ];
  private teacherLabSubmissions: LabSubmissionData[] = [
    {
      id: 'submission-1',
      studentId: 'student-001',
      studentName: 'Вольфович Арсений',
      programId: 'program-1',
      programTitle: 'Лабораторная работа №1',
      fileUrl: '/uploads/lab1.pdf',
      comment: 'Хорошая работа',
      grade: 5,
      status: 'graded',
      submittedAt: '2026-06-10',
    },
    {
      id: 'submission-2',
      studentId: 'student-002',
      studentName: 'Иванов Иван',
      programId: 'program-1',
      programTitle: 'Лабораторная работа №1',
      fileUrl: '/uploads/lab1_ivanov.pdf',
      comment: undefined,
      grade: undefined,
      status: 'submitted',
      submittedAt: '2026-06-12',
    },
  ];

  // ==================== Users / Auth ====================

  async createUser(data: CreateUserData): Promise<User> {
    const studentId = data.role === 'STUDENT' ? (data.studentId || `student-${this.nextStudentId++}`) : undefined;
    const user = new User(
      this.nextUserId++,
      data.role,
      data.fullName,
      data.passwordHash,
      data.lastName,
      data.birthDate,
      data.groupId,
      data.email,
      studentId,
    );
    this.users.push(user);

    if (data.role === 'STUDENT' && studentId) {
      const groupName = data.groupId ? (this.groups.find(g => g.id === data.groupId)?.name || data.groupId) : data.groupId || 'Unknown';
      this.students.push(new Student(new StudentId(studentId), data.fullName, groupName));
      this.teacherStudents.push({
        id: studentId,
        fullName: data.fullName,
        groupId: data.groupId || '',
        isExpelled: false,
        isNew: true,
      });
    }

    return user;
  }

  async findUserById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) ?? null;
  }

  async findUserByFullName(fullName: string): Promise<User | null> {
    return this.users.find(u => u.fullName.toLowerCase() === fullName.toLowerCase()) ?? null;
  }

  async resolveGroupName(groupId: string): Promise<string> {
    return this.groups.find(g => g.id === groupId)?.name || groupId;
  }

  // ==================== Sessions / Refresh Tokens ====================

  async createSession(userId: number, refreshToken: string, expiresAt: Date): Promise<Session> {
    const session = new Session(refreshToken, userId, new Date(), expiresAt);
    this.sessions.push(session);
    return session;
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessions.find(s => s.refreshToken === refreshToken) ?? null;
  }

  async deleteSession(refreshToken: string): Promise<void> {
    const index = this.sessions.findIndex(s => s.refreshToken === refreshToken);
    if (index !== -1) {
      this.sessions.splice(index, 1);
    }
  }

  async deleteAllUserSessions(userId: number): Promise<void> {
    this.sessions = this.sessions.filter(s => s.userId !== userId);
  }

  // ==================== Students ====================

  async findStudentById(studentId: string): Promise<Student | null> {
    return this.students.find(s => s.id.value === studentId) ?? null;
  }

  async findScheduleByStudentId(studentId: string): Promise<Array<{ course: Course }>> {
    const enrolledCourseIds = this.studentCourses
      .filter(sc => sc.studentId === studentId)
      .map(sc => sc.courseId);
    return this.courses
      .filter(course => enrolledCourseIds.includes(course.id.value))
      .map(course => ({ course }));
  }

  async findGradesByStudentId(studentId: string): Promise<Grade[]> {
    return this.studentGrades.filter(g => g.studentId === studentId);
  }

  async findAttendanceByStudentId(studentId: string): Promise<Attendance[]> {
    return this.studentAttendance.filter(a => a.studentId === studentId);
  }

  async findCourseById(courseId: string): Promise<Course | null> {
    return this.courses.find(c => c.id.value === courseId) ?? null;
  }

  async findCoursesByIds(courseIds: string[]): Promise<Course[]> {
    return this.courses.filter(c => courseIds.includes(c.id.value));
  }

  // ==================== Lab works (student) ====================

  async findLabWorkById(labId: string): Promise<LabWork | null> {
    return this.labs.find(l => l.id.value === labId) ?? null;
  }

  async findLabSubmission(studentId: string, labId: string): Promise<LabSubmission | null> {
    return this.labSubmissions.find(s => s.studentId === studentId && s.labId === labId) ?? null;
  }

  // ==================== Teacher — groups ====================

  async findTeacherGroups(teacherId: number): Promise<TeacherGroupInfo[]> {
    const result: TeacherGroupInfo[] = [];
    for (const tg of this.teacherGroups) {
      if (tg.teacherId === teacherId) {
        const group = this.groups.find(g => g.id === tg.groupId);
        const subject = this.subjects.find(s => s.id === tg.subjectId);
        if (group && subject) {
          result.push({
            groupId: group.id,
            groupName: group.name,
            subjectId: subject.id,
            subjectName: subject.name,
          });
        }
      }
    }
    return result;
  }

  async checkTeacherAccess(teacherId: number, groupId: string, subjectId: string): Promise<boolean> {
    return this.teacherGroups.some(tg =>
      tg.teacherId === teacherId && tg.groupId === groupId && tg.subjectId === subjectId
    );
  }

  async checkTeacherSubjectAccess(teacherId: number, subjectId: string): Promise<boolean> {
    return this.teacherGroups.some(tg => tg.teacherId === teacherId && tg.subjectId === subjectId);
  }

  async findGroupById(groupId: string): Promise<TeacherGroupData | null> {
    return this.groups.find(g => g.id === groupId) ?? null;
  }

  async findSubjectById(subjectId: string): Promise<TeacherSubjectData | null> {
    return this.subjects.find(s => s.id === subjectId) ?? null;
  }

  async findStudentsByGroup(groupId: string): Promise<TeacherStudentData[]> {
    return this.teacherStudents.filter(s => s.groupId === groupId);
  }

  // ==================== Teacher — lessons ====================

  async findLessonsByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherLessonData[]> {
    return this.lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId);
  }

  async findLessonById(lessonId: string): Promise<TeacherLessonData | null> {
    return this.lessons.find(l => l.id === lessonId) ?? null;
  }

  async createLesson(data: CreateLessonData): Promise<TeacherLessonData> {
    const newLesson: TeacherLessonData = {
      id: `lesson-${Date.now()}`,
      ...data,
    };
    this.lessons.push(newLesson);
    return newLesson;
  }

  // ==================== Teacher — grades & attendance ====================

  async findGradesByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherGradeData[]> {
    const lessonIds = this.lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId).map(l => l.id);
    return this.teacherGradesRecords.filter(g => lessonIds.includes(g.lessonId));
  }

  async saveGrade(data: SaveGradeData): Promise<void> {
    const existingIndex = this.teacherGradesRecords.findIndex(
      g => g.studentId === data.studentId && g.lessonId === data.lessonId
    );
    if (existingIndex !== -1) {
      this.teacherGradesRecords[existingIndex] = data;
    } else {
      this.teacherGradesRecords.push(data);
    }
  }

  async findAttendancesByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherAttendanceData[]> {
    const lessonIds = this.lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId).map(l => l.id);
    return this.teacherAttendanceRecords.filter(a => lessonIds.includes(a.lessonId));
  }

  async saveAttendance(data: SaveAttendanceData): Promise<void> {
    const existingIndex = this.teacherAttendanceRecords.findIndex(
      a => a.studentId === data.studentId && a.lessonId === data.lessonId
    );
    if (existingIndex !== -1) {
      this.teacherAttendanceRecords[existingIndex] = data;
    } else {
      this.teacherAttendanceRecords.push(data);
    }
  }

  // ==================== Teacher — program ====================

  async findProgramBySubject(subjectId: string): Promise<ProgramItemData[]> {
    return this.programs.filter(p => p.subjectId === subjectId);
  }

  async findProgramItemById(itemId: string): Promise<ProgramItemData | null> {
    return this.programs.find(p => p.id === itemId) ?? null;
  }

  async createProgramItem(data: Omit<ProgramItemData, 'id'>): Promise<ProgramItemData> {
    const newItem: ProgramItemData = {
      id: `program-${Date.now()}`,
      ...data,
    };
    this.programs.push(newItem);
    return newItem;
  }

  async updateProgramItem(itemId: string, data: Partial<Omit<ProgramItemData, 'id'>>): Promise<void> {
    const index = this.programs.findIndex(p => p.id === itemId);
    if (index !== -1) {
      this.programs[index] = { ...this.programs[index], ...data };
    }
  }

  async deleteProgramItem(itemId: string): Promise<void> {
    const index = this.programs.findIndex(p => p.id === itemId);
    if (index !== -1) {
      this.programs.splice(index, 1);
    }
  }

  // ==================== Teacher — lab submissions ====================

  async findLabSubmissionsByProgram(programId: string): Promise<LabSubmissionData[]> {
    return this.teacherLabSubmissions.filter(s => s.programId === programId);
  }

  async findLabSubmissionById(submissionId: string): Promise<LabSubmissionData | null> {
    return this.teacherLabSubmissions.find(s => s.id === submissionId) ?? null;
  }

  async updateLabSubmission(submissionId: string, data: Partial<Omit<LabSubmissionData, 'id'>>): Promise<void> {
    const index = this.teacherLabSubmissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      this.teacherLabSubmissions[index] = { ...this.teacherLabSubmissions[index], ...data };
    }
  }
}
