import { StudentUseCaseImpl } from '../../../../src/application/usecases/student.usecase';
import { StudentReadRepository } from '../../../../src/domain/repositories/StudentReadRepository';
import { Student } from '../../../../src/domain/entities/Student';
import { Course } from '../../../../src/domain/entities/Course';
import { Grade } from '../../../../src/domain/entities/Grade';
import { Attendance } from '../../../../src/domain/entities/Attendance';
import { StudentId } from '../../../../src/domain/value-objects/StudentId';
import { CourseId } from '../../../../src/domain/value-objects/CourseId';
import { NotFoundError } from '../../../../src/domain/errors/NotFoundError';

describe('StudentUseCase', () => {
  let mockRepo: jest.Mocked<StudentReadRepository>;
  let useCase: StudentUseCaseImpl;

  beforeEach(() => {
    mockRepo = {
      findStudentById: jest.fn(),
      findScheduleByStudentId: jest.fn(),
      findGradesByStudentId: jest.fn(),
      findAttendanceByStudentId: jest.fn(),
      findCourseById: jest.fn(),
      findCoursesByIds: jest.fn(),
      findLabWorkById: jest.fn(),
      findLabSubmission: jest.fn(),
    };
    useCase = new StudentUseCaseImpl(mockRepo);
  });

  describe('getSchedule', () => {
    it('returns schedule for existing student', async () => {
      const student = new Student(new StudentId('s1'), 'Иван', 'Группа 1');
      const course = new Course(new CourseId('c1'), 'Математика', 'Петров', [
        { day: 'Пн', time: '09:00', room: '101' },
      ]);

      mockRepo.findStudentById.mockResolvedValue(student);
      mockRepo.findScheduleByStudentId.mockResolvedValue([{ course }]);

      const result = await useCase.getSchedule('s1');

      expect(result.studentName).toBe('Иван');
      expect(result.schedule).toHaveLength(1);
      expect(result.schedule[0].subjectName).toBe('Математика');
    });

    it('throws NotFoundError for missing student', async () => {
      mockRepo.findStudentById.mockResolvedValue(null);

      await expect(useCase.getSchedule('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getJournal', () => {
    it('returns journal with grades, attendance and dates', async () => {
      const student = new Student(new StudentId('s1'), 'Иван', 'Группа 1');
      const course = new Course(new CourseId('c1'), 'Математика', 'Петров', [{ day: 'Пн', time: '09:00', room: '101' }]);
      const grade = new Grade('s1', 'c1', 8, 'lab', '2026-05-15');
      const attendance = new Attendance('s1', 'c1', '2026-05-12', 'PRESENT');

      mockRepo.findStudentById.mockResolvedValue(student);
      mockRepo.findScheduleByStudentId.mockResolvedValue([{ course }]);
      mockRepo.findGradesByStudentId.mockResolvedValue([grade]);
      mockRepo.findAttendanceByStudentId.mockResolvedValue([attendance]);
      mockRepo.findCoursesByIds.mockResolvedValue([course]);

      const result = await useCase.getJournal('s1');

      expect(result.grades).toHaveLength(1);
      expect(result.grades[0].value).toBe(8);
      expect(result.attendance).toHaveLength(1);
      expect(result.attendance[0].status).toBe('PRESENT');
      expect(result.dates).toContain('2026-05-12');
      expect(result.dates).toContain('2026-05-15');
    });
  });

  describe('getSubjectProgress', () => {
    it('returns subject progress with average', async () => {
      const student = new Student(new StudentId('s1'), 'Иван', 'Группа 1');
      const course = new Course(new CourseId('c1'), 'Математика', 'Петров', [{ day: 'Пн', time: '09:00', room: '101' }]);

      mockRepo.findStudentById.mockResolvedValue(student);
      mockRepo.findCourseById.mockResolvedValue(course);
      mockRepo.findGradesByStudentId.mockResolvedValue([
        new Grade('s1', 'c1', 8, 'lab', '2026-05-01'),
        new Grade('s1', 'c1', 10, 'test', '2026-05-15'),
      ]);
      mockRepo.findAttendanceByStudentId.mockResolvedValue([
        new Attendance('s1', 'c1', '2026-05-12', 'PRESENT'),
        new Attendance('s1', 'c1', '2026-05-19', 'ABSENT'),
      ]);

      const result = await useCase.getSubjectProgress('s1', 'c1');

      expect(result.subjectName).toBe('Математика');
      expect(result.grades).toHaveLength(2);
      expect(result.summary).toContain('Средний балл 9');
      expect(result.summary).toContain('present=1');
      expect(result.summary).toContain('absent=1');
    });
  });
});
