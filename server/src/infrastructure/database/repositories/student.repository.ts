import { Student } from '../../../domain/entities/Student';
import { Course } from '../../../domain/entities/Course';
import { Grade } from '../../../domain/entities/Grade';
import { Attendance } from '../../../domain/entities/Attendance';
import { LabWork } from '../../../domain/entities/LabWork';
import { LabSubmission } from '../../../domain/entities/LabSubmission';

export interface StudentRepository {
  findStudentById(studentId: string): Promise<Student | null>;
  findScheduleByStudentId(studentId: string): Promise<Array<{ course: Course }>>;
  findGradesByStudentId(studentId: string): Promise<Grade[]>;
  findAttendanceByStudentId(studentId: string): Promise<Attendance[]>;
  findCourseById(courseId: string): Promise<Course | null>;
  findLabWorkById(labId: string): Promise<LabWork | null>;
  findLabSubmission(studentId: string, labId: string): Promise<LabSubmission | null>;
}
