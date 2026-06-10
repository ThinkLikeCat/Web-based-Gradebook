import { Student } from '../entities/Student';
import { Course } from '../entities/Course';
import { Grade } from '../entities/Grade';
import { Attendance } from '../entities/Attendance';
import { LabWork } from '../entities/LabWork';
import { LabSubmission } from '../entities/LabSubmission';

export interface StudentReadRepository {
  findStudentById(studentId: string): Promise<Student | null>;
  findScheduleByStudentId(studentId: string): Promise<Array<{ course: Course }>>;
  findGradesByStudentId(studentId: string): Promise<Grade[]>;
  findAttendanceByStudentId(studentId: string): Promise<Attendance[]>;
  findCourseById(courseId: string): Promise<Course | null>;
  findCoursesByIds(courseIds: string[]): Promise<Course[]>;
  findLabWorkById(labId: string): Promise<LabWork | null>;
  findLabSubmission(studentId: string, labId: string): Promise<LabSubmission | null>;
}
