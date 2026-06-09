import { Student } from '../../../domain/entities/Student';
import { Course } from '../../../domain/entities/Course';
import { Grade } from '../../../domain/entities/Grade';
import { Attendance } from '../../../domain/entities/Attendance';
import { LabWork } from '../../../domain/entities/LabWork';
import { LabSubmission } from '../../../domain/entities/LabSubmission';
import { User } from '../../../domain/entities/User';
import { StudentId } from '../../../domain/value-objects/StudentId';
import { CourseId } from '../../../domain/value-objects/CourseId';
import { LabWorkId } from '../../../domain/value-objects/LabWorkId';
import { ProgramItemDto } from '../../../application/dtos/teacher-program.dto';
import { LabSubmissionDto, TeacherGroupInfoDto } from '../../../application/dtos/teacher-lab.dto';
import { CreateUserData } from '../../../domain/repositories/AuthRepository';
import { TeacherGroupData, TeacherSubjectData, TeacherStudentData } from '../../../domain/repositories/TeacherAccessRepository';
import { TeacherLessonData, TeacherGradeData, TeacherAttendanceData, CreateLessonData, SaveGradeData, SaveAttendanceData } from '../../../domain/repositories/TeacherJournalRepository';
import { AuthRepository } from '../../../domain/repositories/AuthRepository';
import { StudentReadRepository } from '../../../domain/repositories/StudentReadRepository';
import { TeacherAccessRepository } from '../../../domain/repositories/TeacherAccessRepository';
import { TeacherJournalRepository } from '../../../domain/repositories/TeacherJournalRepository';
import { TeacherProgramRepository } from '../../../domain/repositories/TeacherProgramRepository';

import bcrypt from 'bcryptjs';

let nextUserId = 3;

const users: User[] = [
  new User(1, 'STUDENT', 'Вольфович Арсений', bcrypt.hashSync('Student123$', 10), 'Вольфович', '2007-11-08', 'group-1'),
  new User(2, 'TEACHER', 'Вольфович Александр', bcrypt.hashSync('Login123$', 10), 'Вольфович', undefined, undefined, 'teacher@mail.com'),
];

const students: Student[] = [
  new Student(new StudentId('student-001'), 'Иван Иванов', 'Группа 101'),
  new Student(new StudentId('student-002'), 'Пётр Петров', 'Группа 101'),
];

const studentCourses: { studentId: string; courseId: string }[] = [
  { studentId: 'student-001', courseId: 'course-001' },
  { studentId: 'student-001', courseId: 'course-002' },
  { studentId: 'student-002', courseId: 'course-001' },
];

const courses: Course[] = [
  new Course(new CourseId('course-001'), 'Математика', 'Преп. Петров', [
    { day: 'Понедельник', time: '09:00-10:30', room: 'Ауд. 12' },
    { day: 'Среда', time: '11:00-12:30', room: 'Ауд. 12' },
  ]),
  new Course(new CourseId('course-002'), 'Физика', 'Преп. Сидоров', [
    { day: 'Вторник', time: '10:00-11:30', room: 'Ауд. 34' },
  ]),
];

const studentGrades: Grade[] = [
  new Grade('student-001', 'course-001', 9, 'lab', '2026-05-15'),
  new Grade('student-001', 'course-001', 9, 'test', '2026-05-20'),
  new Grade('student-001', 'course-002', 8, 'exam', '2026-05-18'),
];

const studentAttendance: Attendance[] = [
  new Attendance('student-001', 'course-001', '2026-05-12', 'PRESENT'),
  new Attendance('student-001', 'course-001', '2026-05-19', 'LATE'),
  new Attendance('student-001', 'course-002', '2026-05-13', 'ABSENT'),
];

const labs: LabWork[] = [
  new LabWork(new LabWorkId('lab-001'), 'course-001', 'Лабораторная работа 1', '2026-05-01', '2026-05-10', false, 'Теоретические материалы по линейной алгебре', []),
  new LabWork(new LabWorkId('lab-002'), 'course-002', 'Лабораторная работа 2', '2026-05-05', '2026-05-14', true, 'Теория электростатики', [
    { id: 'student-002', name: 'Пётр Петров' },
  ]),
];

const labSubmissions: LabSubmission[] = [
  new LabSubmission('lab-001', 'student-001', '2026-05-09', '/files/lab-001-solution.pdf', 'Хорошая работа, нужны исправления по пункту 3', 88, 'graded'),
  new LabSubmission('lab-002', 'student-001', '2026-05-13', '/files/lab-002-solution.pdf', 'Ждём отчёт о работе команды', null, 'submitted'),
];

// Teacher data
const groups: TeacherGroupData[] = [
  { id: 'group-1', name: 'Т-394' },
  { id: 'group-2', name: 'Т-395' },
];

const subjects: TeacherSubjectData[] = [
  { id: 'subject-1', name: 'Математика' },
  { id: 'subject-2', name: 'Физика' },
  { id: 'subject-3', name: 'Программирование' },
];

const teacherStudents: TeacherStudentData[] = [
  { id: 'student-1', fullName: 'Вольфович Арсений', groupId: 'group-1', isExpelled: false, isNew: false },
  { id: 'student-2', fullName: 'Иванов Иван', groupId: 'group-1', isExpelled: false, isNew: true },
  { id: 'student-3', fullName: 'Петров Петр', groupId: 'group-1', isExpelled: true, isNew: false },
  { id: 'student-4', fullName: 'Сидорова Анна', groupId: 'group-2', isExpelled: false, isNew: false },
];

const teacherGroups = [
  { teacherId: 2, groupId: 'group-1', subjectId: 'subject-1' },
  { teacherId: 2, groupId: 'group-1', subjectId: 'subject-2' },
  { teacherId: 2, groupId: 'group-2', subjectId: 'subject-1' },
];

const lessons: TeacherLessonData[] = [
  { id: 'lesson-1', subjectId: 'subject-1', groupId: 'group-1', date: '2026-06-01', startTime: '09:00', endTime: '10:30' },
  { id: 'lesson-2', subjectId: 'subject-1', groupId: 'group-1', date: '2026-06-08', startTime: '09:00', endTime: '10:30' },
  { id: 'lesson-3', subjectId: 'subject-2', groupId: 'group-1', date: '2026-06-08', startTime: '11:00', endTime: '12:30' },
];

const teacherGradesRecords: TeacherGradeData[] = [
  { studentId: 'student-1', lessonId: 'lesson-1', value: 5, type: 'PRACTICAL' },
  { studentId: 'student-2', lessonId: 'lesson-1', value: 4, type: 'PRACTICAL' },
];

const teacherAttendanceRecords: TeacherAttendanceData[] = [
  { studentId: 'student-1', lessonId: 'lesson-1', status: 'PRESENT' },
  { studentId: 'student-2', lessonId: 'lesson-1', status: 'LATE' },
  { studentId: 'student-3', lessonId: 'lesson-1', status: 'ABSENT' },
];

const programs: ProgramItemDto[] = [
  { id: 'program-1', subjectId: 'subject-1', title: 'Лабораторная работа №1', type: 'LAB', deadline: '2026-06-15', description: 'Решить уравнения', fileUrl: undefined },
  { id: 'program-2', subjectId: 'subject-1', title: 'Контрольная работа', type: 'CONTROL', deadline: '2026-06-20', description: 'Итоговая контрольная', fileUrl: undefined },
  { id: 'program-3', subjectId: 'subject-2', title: 'Лабораторная работа по физике', type: 'LAB', deadline: '2026-06-18', description: 'Измерения', fileUrl: undefined },
];

const teacherLabSubmissions: LabSubmissionDto[] = [
  {
    id: 'submission-1',
    studentId: 'student-1',
    studentName: 'Вольфович Арсений',
    programId: 'program-1',
    programTitle: 'Лабораторная работа №1',
    fileUrl: '/uploads/lab1.pdf',
    comment: 'Хорошая работа',
    grade: 5,
    status: 'CHECKED',
    submittedAt: '2026-06-10',
  },
  {
    id: 'submission-2',
    studentId: 'student-2',
    studentName: 'Иванов Иван',
    programId: 'program-1',
    programTitle: 'Лабораторная работа №1',
    fileUrl: '/uploads/lab1_ivanov.pdf',
    comment: undefined,
    grade: undefined,
    status: 'SUBMITTED',
    submittedAt: '2026-06-12',
  },
];

export class InMemoryGradebookRepository implements
  AuthRepository,
  StudentReadRepository,
  TeacherAccessRepository,
  TeacherJournalRepository,
  TeacherProgramRepository {
  // ==================== Users / Auth ====================

  async createUser(data: CreateUserData): Promise<User> {
    const user = new User(
      nextUserId++,
      data.role,
      data.fullName,
      data.passwordHash,
      data.lastName,
      data.birthDate,
      data.groupId,
      data.email,
    );
    users.push(user);
    return user;
  }

  async findUserById(id: number): Promise<User | null> {
    return users.find(u => u.id === id) ?? null;
  }

  async findUserByFullName(fullName: string): Promise<User | null> {
    return users.find(u => u.fullName.toLowerCase() === fullName.toLowerCase()) ?? null;
  }

  // ==================== Students ====================

  async findStudentById(studentId: string): Promise<Student | null> {
    return students.find(s => s.id.value === studentId) ?? null;
  }

  async findScheduleByStudentId(studentId: string): Promise<Array<{ course: Course }>> {
    const enrolledCourseIds = studentCourses
      .filter(sc => sc.studentId === studentId)
      .map(sc => sc.courseId);
    return courses
      .filter(course => enrolledCourseIds.includes(course.id.value))
      .map(course => ({ course }));
  }

  async findGradesByStudentId(studentId: string): Promise<Grade[]> {
    return studentGrades.filter(g => g.studentId === studentId);
  }

  async findAttendanceByStudentId(studentId: string): Promise<Attendance[]> {
    return studentAttendance.filter(a => a.studentId === studentId);
  }

  async findCourseById(courseId: string): Promise<Course | null> {
    return courses.find(c => c.id.value === courseId) ?? null;
  }

  // ==================== Lab works (student) ====================

  async findLabWorkById(labId: string): Promise<LabWork | null> {
    return labs.find(l => l.id.value === labId) ?? null;
  }

  async findLabSubmission(studentId: string, labId: string): Promise<LabSubmission | null> {
    return labSubmissions.find(s => s.studentId === studentId && s.labId === labId) ?? null;
  }

  // ==================== Teacher — groups ====================

  async findTeacherGroups(teacherId: number): Promise<TeacherGroupInfoDto[]> {
    const result: TeacherGroupInfoDto[] = [];
    for (const tg of teacherGroups) {
      if (tg.teacherId === teacherId) {
        const group = groups.find(g => g.id === tg.groupId);
        const subject = subjects.find(s => s.id === tg.subjectId);
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
    return teacherGroups.some(tg =>
      tg.teacherId === teacherId && tg.groupId === groupId && tg.subjectId === subjectId
    );
  }

  async checkTeacherSubjectAccess(teacherId: number, subjectId: string): Promise<boolean> {
    return teacherGroups.some(tg => tg.teacherId === teacherId && tg.subjectId === subjectId);
  }

  async findGroupById(groupId: string): Promise<TeacherGroupData | null> {
    return groups.find(g => g.id === groupId) ?? null;
  }

  async findSubjectById(subjectId: string): Promise<TeacherSubjectData | null> {
    return subjects.find(s => s.id === subjectId) ?? null;
  }

  async findStudentsByGroup(groupId: string): Promise<TeacherStudentData[]> {
    return teacherStudents.filter(s => s.groupId === groupId);
  }

  // ==================== Teacher — lessons ====================

  async findLessonsByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherLessonData[]> {
    return lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId);
  }

  async findLessonById(lessonId: string): Promise<TeacherLessonData | null> {
    return lessons.find(l => l.id === lessonId) ?? null;
  }

  async createLesson(data: CreateLessonData): Promise<TeacherLessonData> {
    const newLesson: TeacherLessonData = {
      id: `lesson-${Date.now()}`,
      ...data,
    };
    lessons.push(newLesson);
    return newLesson;
  }

  // ==================== Teacher — grades & attendance ====================

  async findGradesByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherGradeData[]> {
    const lessonIds = lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId).map(l => l.id);
    return teacherGradesRecords.filter(g => lessonIds.includes(g.lessonId));
  }

  async saveGrade(data: SaveGradeData): Promise<void> {
    const existingIndex = teacherGradesRecords.findIndex(
      g => g.studentId === data.studentId && g.lessonId === data.lessonId
    );
    if (existingIndex !== -1) {
      teacherGradesRecords[existingIndex] = data;
    } else {
      teacherGradesRecords.push(data);
    }
  }

  async findAttendancesByGroupAndSubject(groupId: string, subjectId: string): Promise<TeacherAttendanceData[]> {
    const lessonIds = lessons.filter(l => l.groupId === groupId && l.subjectId === subjectId).map(l => l.id);
    return teacherAttendanceRecords.filter(a => lessonIds.includes(a.lessonId));
  }

  async saveAttendance(data: SaveAttendanceData): Promise<void> {
    const existingIndex = teacherAttendanceRecords.findIndex(
      a => a.studentId === data.studentId && a.lessonId === data.lessonId
    );
    if (existingIndex !== -1) {
      teacherAttendanceRecords[existingIndex] = data;
    } else {
      teacherAttendanceRecords.push(data);
    }
  }

  // ==================== Teacher — program ====================

  async findProgramBySubject(subjectId: string): Promise<ProgramItemDto[]> {
    return programs.filter(p => p.subjectId === subjectId);
  }

  async findProgramItemById(itemId: string): Promise<ProgramItemDto | null> {
    return programs.find(p => p.id === itemId) ?? null;
  }

  async createProgramItem(data: Omit<ProgramItemDto, 'id'>): Promise<ProgramItemDto> {
    const newItem: ProgramItemDto = {
      id: `program-${Date.now()}`,
      ...data,
    };
    programs.push(newItem);
    return newItem;
  }

  async updateProgramItem(itemId: string, data: Partial<Omit<ProgramItemDto, 'id'>>): Promise<void> {
    const index = programs.findIndex(p => p.id === itemId);
    if (index !== -1) {
      programs[index] = { ...programs[index], ...data };
    }
  }

  async deleteProgramItem(itemId: string): Promise<void> {
    const index = programs.findIndex(p => p.id === itemId);
    if (index !== -1) {
      programs.splice(index, 1);
    }
  }

  // ==================== Teacher — lab submissions ====================

  async findLabSubmissionsByProgram(programId: string): Promise<LabSubmissionDto[]> {
    return teacherLabSubmissions.filter(s => s.programId === programId);
  }

  async findLabSubmissionById(submissionId: string): Promise<LabSubmissionDto | null> {
    return teacherLabSubmissions.find(s => s.id === submissionId) ?? null;
  }

  async updateLabSubmission(submissionId: string, data: Partial<Omit<LabSubmissionDto, 'id'>>): Promise<void> {
    const index = teacherLabSubmissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      teacherLabSubmissions[index] = { ...teacherLabSubmissions[index], ...data };
    }
  }
}
