import { StudentRepository } from './student.repository';
import { Student } from '../../../domain/entities/Student';
import { Course } from '../../../domain/entities/Course';
import { Grade } from '../../../domain/entities/Grade';
import { Attendance } from '../../../domain/entities/Attendance';
import { LabWork } from '../../../domain/entities/LabWork';
import { LabSubmission } from '../../../domain/entities/LabSubmission';
import { StudentId } from '../../../domain/value-objects/StudentId';
import { CourseId } from '../../../domain/value-objects/CourseId';
import { LabWorkId } from '../../../domain/value-objects/LabWorkId';

const students: Student[] = [
  new Student(new StudentId('student-001'), 'Иван Иванов', 'Группа 101'),
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

const grades: Grade[] = [
  new Grade('course-001', 'lab', 85, '2026-05-15'),
  new Grade('course-001', 'test', 92, '2026-05-20'),
  new Grade('course-002', 'exam', 78, '2026-05-18'),
];

const attendance: Attendance[] = [
  new Attendance('course-001', '2026-05-12', 'present'),
  new Attendance('course-001', '2026-05-19', 'late'),
  new Attendance('course-002', '2026-05-13', 'absent'),
];

const labs: LabWork[] = [
  new LabWork(new LabWorkId('lab-001'), 'course-001', 'Лабораторная работа 1', '2026-05-01', '2026-05-10', false, 'Теоретические материалы по линейной алгебре', []),
  new LabWork(new LabWorkId('lab-002'), 'course-002', 'Лабораторная работа 2', '2026-05-05', '2026-05-14', true, 'Теория электростатики', [
    { id: 'student-002', name: 'Пётр Петров' },
  ]),
];

const submissions: LabSubmission[] = [
  new LabSubmission('lab-001', 'student-001', '2026-05-09', '/files/lab-001-solution.pdf', 'Хорошая работа, нужны исправления по пункту 3', 88, 'graded'),
  new LabSubmission('lab-002', 'student-001', '2026-05-13', '/files/lab-002-solution.pdf', 'Ждём отчёт о работе команды', null, 'submitted'),
];

export class InMemoryStudentRepository implements StudentRepository {
  async findStudentById(studentId: string): Promise<Student | null> {
    return students.find((student) => student.id.value === studentId) ?? null;
  }

  async findScheduleByStudentId(studentId: string): Promise<Array<{ course: Course }>> {
    const student = await this.findStudentById(studentId);
    if (!student) return [];
    return courses.map((course) => ({ course }));
  }

  async findGradesByStudentId(studentId: string): Promise<Grade[]> {
    const student = await this.findStudentById(studentId);
    if (!student) return [];
    return grades;
  }

  async findAttendanceByStudentId(studentId: string): Promise<Attendance[]> {
    const student = await this.findStudentById(studentId);
    if (!student) return [];
    return attendance;
  }

  async findCourseById(courseId: string): Promise<Course | null> {
    return courses.find((course) => course.id.value === courseId) ?? null;
  }

  async findLabWorkById(labId: string): Promise<LabWork | null> {
    return labs.find((lab) => lab.id.value === labId) ?? null;
  }

  async findLabSubmission(studentId: string, labId: string): Promise<LabSubmission | null> {
    return submissions.find((submission) => submission.studentId === studentId && submission.labId === labId) ?? null;
  }
}
