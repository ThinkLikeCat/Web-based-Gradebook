import { TeacherUseCaseImpl } from '../../../../src/application/usecases/teacher.usecase';
import { TeacherAccessRepository } from '../../../../src/domain/repositories/TeacherAccessRepository';
import { TeacherJournalRepository } from '../../../../src/domain/repositories/TeacherJournalRepository';
import { TeacherProgramRepository } from '../../../../src/domain/repositories/TeacherProgramRepository';
import { NotFoundError } from '../../../../src/domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../../src/domain/errors/UnauthorizedError';

describe('TeacherUseCase', () => {
  let accessRepo: jest.Mocked<TeacherAccessRepository>;
  let journalRepo: jest.Mocked<TeacherJournalRepository>;
  let programRepo: jest.Mocked<TeacherProgramRepository>;
  let useCase: TeacherUseCaseImpl;

  beforeEach(() => {
    accessRepo = {
      findTeacherGroups: jest.fn(),
      checkTeacherAccess: jest.fn(),
      checkTeacherSubjectAccess: jest.fn(),
      findGroupById: jest.fn(),
      findSubjectById: jest.fn(),
      findStudentsByGroup: jest.fn(),
    };
    journalRepo = {
      findLessonsByGroupAndSubject: jest.fn(),
      findLessonById: jest.fn(),
      createLesson: jest.fn(),
      findGradesByGroupAndSubject: jest.fn(),
      saveGrade: jest.fn(),
      findAttendancesByGroupAndSubject: jest.fn(),
      saveAttendance: jest.fn(),
    };
    programRepo = {
      findProgramBySubject: jest.fn(),
      findProgramItemById: jest.fn(),
      createProgramItem: jest.fn(),
      updateProgramItem: jest.fn(),
      deleteProgramItem: jest.fn(),
      findLabSubmissionsByProgram: jest.fn(),
      findLabSubmissionById: jest.fn(),
      updateLabSubmission: jest.fn(),
    };
    useCase = new TeacherUseCaseImpl(accessRepo, journalRepo, programRepo);
  });

  describe('getTeacherGroups', () => {
    it('returns groups for teacher', async () => {
      accessRepo.findTeacherGroups.mockResolvedValue([
        { groupId: 'g1', groupName: 'Т-394', subjectId: 's1', subjectName: 'Математика' },
      ]);

      const groups = await useCase.getTeacherGroups(2);

      expect(groups).toHaveLength(1);
      expect(groups[0].groupName).toBe('Т-394');
    });
  });

  describe('getJournal', () => {
    it('returns journal with students, lessons, grades, attendance', async () => {
      accessRepo.checkTeacherAccess.mockResolvedValue(true);
      accessRepo.findGroupById.mockResolvedValue({ id: 'g1', name: 'Т-394' });
      accessRepo.findSubjectById.mockResolvedValue({ id: 's1', name: 'Математика' });
      accessRepo.findStudentsByGroup.mockResolvedValue([
        { id: 'st1', fullName: 'Иванов', groupId: 'g1', isExpelled: false, isNew: false },
      ]);
      journalRepo.findLessonsByGroupAndSubject.mockResolvedValue([
        { id: 'l1', subjectId: 's1', groupId: 'g1', date: '2026-06-01', startTime: '09:00', endTime: '10:30' },
      ]);
      journalRepo.findGradesByGroupAndSubject.mockResolvedValue([
        { studentId: 'st1', lessonId: 'l1', value: 5, type: 'PRACTICAL' },
      ]);
      journalRepo.findAttendancesByGroupAndSubject.mockResolvedValue([
        { studentId: 'st1', lessonId: 'l1', status: 'PRESENT' },
      ]);

      const result = await useCase.getJournal(2, 'g1', 's1');

      expect(result.groupName).toBe('Т-394');
      expect(result.subjectName).toBe('Математика');
      expect(result.students).toHaveLength(1);
      expect(result.lessons).toHaveLength(1);
      expect(result.grades).toHaveLength(1);
      expect(result.attendances).toHaveLength(1);
    });

    it('throws when teacher has no access', async () => {
      accessRepo.checkTeacherAccess.mockResolvedValue(false);

      await expect(useCase.getJournal(2, 'g1', 's1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('setGrade', () => {
    it('saves grade for valid lesson and access', async () => {
      journalRepo.findLessonById.mockResolvedValue({ id: 'l1', subjectId: 's1', groupId: 'g1', date: '', startTime: '', endTime: '' });
      accessRepo.checkTeacherAccess.mockResolvedValue(true);

      await useCase.setGrade(2, { studentId: 'st1', lessonId: 'l1', value: 8, type: 'PRACTICAL' });

      expect(journalRepo.saveGrade).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'st1', value: 8 }),
      );
    });

    it('throws when lesson is not found', async () => {
      journalRepo.findLessonById.mockResolvedValue(null);

      await expect(useCase.setGrade(2, { studentId: 'st1', lessonId: 'l1', value: 8, type: 'PRACTICAL' })).rejects.toThrow(NotFoundError);
    });

    it('throws for out-of-range grade value', async () => {
      journalRepo.findLessonById.mockResolvedValue({ id: 'l1', subjectId: 's1', groupId: 'g1', date: '', startTime: '', endTime: '' });
      accessRepo.checkTeacherAccess.mockResolvedValue(true);

      await expect(useCase.setGrade(2, { studentId: 'st1', lessonId: 'l1', value: 15, type: 'PRACTICAL' })).rejects.toThrow('1 до 10');
    });
  });

  describe('setAttendance', () => {
    it('saves attendance for valid lesson', async () => {
      journalRepo.findLessonById.mockResolvedValue({ id: 'l1', subjectId: 's1', groupId: 'g1', date: '', startTime: '', endTime: '' });
      accessRepo.checkTeacherAccess.mockResolvedValue(true);

      await useCase.setAttendance(2, { studentId: 'st1', lessonId: 'l1', status: 'LATE' });

      expect(journalRepo.saveAttendance).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'st1', status: 'LATE' }),
      );
    });
  });

  describe('addLesson', () => {
    it('creates lesson with access check', async () => {
      accessRepo.checkTeacherAccess.mockResolvedValue(true);
      journalRepo.createLesson.mockResolvedValue({ id: 'l2', subjectId: 's1', groupId: 'g1', date: '2026-06-08', startTime: '09:00', endTime: '10:30' });

      await useCase.addLesson(2, { subjectId: 's1', groupId: 'g1', date: '2026-06-08', startTime: '09:00', endTime: '10:30' });

      expect(journalRepo.createLesson).toHaveBeenCalled();
    });

    it('throws UnauthorizedError when access denied', async () => {
      accessRepo.checkTeacherAccess.mockResolvedValue(false);

      await expect(useCase.addLesson(2, { subjectId: 's1', groupId: 'g1', date: '', startTime: '', endTime: '' })).rejects.toThrow(UnauthorizedError);
    });
  });
});
