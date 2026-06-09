import { InMemoryGradebookRepository } from '../../src/infrastructure/database/repositories/InMemoryGradebookRepository';
import { StudentId } from '../../src/domain/value-objects/StudentId';
import { CourseId } from '../../src/domain/value-objects/CourseId';
import { LabWorkId } from '../../src/domain/value-objects/LabWorkId';

describe('InMemoryGradebookRepository — integration', () => {
  let repo: InMemoryGradebookRepository;

  beforeEach(() => {
    repo = new InMemoryGradebookRepository();
  });

  // ==================== Auth ====================

  describe('AuthRepository', () => {
    it('creates and finds user by id', async () => {
      const user = await repo.createUser({
        role: 'STUDENT',
        fullName: 'Новый Студент',
        lastName: 'Новый',
        passwordHash: 'hash',
        birthDate: '2000-01-01',
        groupId: 'group-1',
      });

      expect(user.id).toBeGreaterThan(0);
      expect(user.fullName).toBe('Новый Студент');

      const found = await repo.findUserById(user.id);
      expect(found).not.toBeNull();
      expect(found!.fullName).toBe('Новый Студент');
    });

    it('finds user by fullName (case-insensitive)', async () => {
      const user = await repo.findUserByFullName('вольфович арсений');
      expect(user).not.toBeNull();
      expect(user!.id).toBe(1);
    });

    it('returns null for unknown user', async () => {
      const user = await repo.findUserByFullName('unknown');
      expect(user).toBeNull();
    });
  });

  // ==================== Students ====================

  describe('StudentReadRepository', () => {
    it('finds student by id', async () => {
      const student = await repo.findStudentById('student-001');
      expect(student).not.toBeNull();
      expect(student!.name).toBe('Иван Иванов');
    });

    it('returns null for unknown student', async () => {
      expect(await repo.findStudentById('nonexistent')).toBeNull();
    });

    it('returns schedule for a student', async () => {
      const schedule = await repo.findScheduleByStudentId('student-001');
      expect(schedule.length).toBeGreaterThan(0);
      expect(schedule[0].course.name).toBe('Математика');
    });

    it('returns grades for a student', async () => {
      const grades = await repo.findGradesByStudentId('student-001');
      expect(grades.length).toBeGreaterThan(0);
      expect(grades[0].value).toBeGreaterThanOrEqual(1);
      expect(grades[0].value).toBeLessThanOrEqual(10);
    });

    it('returns attendance for a student', async () => {
      const attendance = await repo.findAttendanceByStudentId('student-001');
      expect(attendance.length).toBeGreaterThan(0);
      expect(['PRESENT', 'LATE', 'ABSENT']).toContain(attendance[0].status);
    });
  });

  // ==================== Teacher access ====================

  describe('TeacherAccessRepository', () => {
    it('returns groups for teacher', async () => {
      const groups = await repo.findTeacherGroups(2);
      expect(groups.length).toBeGreaterThan(0);
      expect(groups[0].groupName).toBeTruthy();
    });

    it('checks teacher access correctly', async () => {
      const ok = await repo.checkTeacherAccess(2, 'group-1', 'subject-1');
      expect(ok).toBe(true);

      const denied = await repo.checkTeacherAccess(2, 'group-1', 'nonexistent');
      expect(denied).toBe(false);
    });

    it('finds students by group', async () => {
      const students = await repo.findStudentsByGroup('group-1');
      expect(students.length).toBeGreaterThan(0);
      expect(students[0].fullName).toBeTruthy();
    });
  });

  // ==================== Teacher journal ====================

  describe('TeacherJournalRepository', () => {
    it('finds lessons by group and subject', async () => {
      const lessons = await repo.findLessonsByGroupAndSubject('group-1', 'subject-1');
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0].id).toBeTruthy();
    });

    it('creates a lesson', async () => {
      const lesson = await repo.createLesson({
        subjectId: 'subject-1',
        groupId: 'group-1',
        date: '2026-07-01',
        startTime: '09:00',
        endTime: '10:30',
      });

      expect(lesson.id).toMatch(/^lesson-/);
      expect(lesson.date).toBe('2026-07-01');
    });

    it('saves and retrieves grades', async () => {
      await repo.saveGrade({ studentId: 'student-1', lessonId: 'lesson-1', value: 7, type: 'PRACTICAL' });
      const grades = await repo.findGradesByGroupAndSubject('group-1', 'subject-1');
      const found = grades.find(g => g.studentId === 'student-1' && g.lessonId === 'lesson-1');
      expect(found).toBeTruthy();
      expect(found!.value).toBe(7);
    });

    it('saves and retrieves attendance', async () => {
      await repo.saveAttendance({ studentId: 'student-1', lessonId: 'lesson-1', status: 'ABSENT' });
      const records = await repo.findAttendancesByGroupAndSubject('group-1', 'subject-1');
      const found = records.find(a => a.studentId === 'student-1' && a.lessonId === 'lesson-1');
      expect(found).toBeTruthy();
      expect(found!.status).toBe('ABSENT');
    });
  });

  // ==================== Teacher program ====================

  describe('TeacherProgramRepository', () => {
    it('finds programs by subject', async () => {
      const items = await repo.findProgramBySubject('subject-1');
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].title).toBeTruthy();
    });

    it('creates program item', async () => {
      const item = await repo.createProgramItem({
        subjectId: 'subject-1',
        title: 'Новая работа',
        type: 'LAB',
        deadline: '2026-07-15',
      });

      expect(item.id).toMatch(/^program-/);
      expect(item.title).toBe('Новая работа');
    });

    it('deletes program item', async () => {
      const item = await repo.createProgramItem({
        subjectId: 'subject-1',
        title: 'To delete',
        type: 'LAB',
      });
      await repo.deleteProgramItem(item.id);
      const found = await repo.findProgramItemById(item.id);
      expect(found).toBeNull();
    });

    it('finds lab submissions by program', async () => {
      const submissions = await repo.findLabSubmissionsByProgram('program-1');
      expect(submissions.length).toBeGreaterThan(0);
      expect(submissions[0].status).toMatch(/^(SUBMITTED|CHECKED)$/);
    });

    it('updates lab submission', async () => {
      await repo.updateLabSubmission('submission-2', { grade: 8, comment: 'Great', status: 'CHECKED' });
      const updated = await repo.findLabSubmissionById('submission-2');
      expect(updated!.grade).toBe(8);
      expect(updated!.comment).toBe('Great');
    });
  });

  // ==================== Lab works (student) ====================

  describe('Lab works (student side)', () => {
    it('finds lab work by id', async () => {
      const lab = await repo.findLabWorkById('lab-001');
      expect(lab).not.toBeNull();
      expect(lab!.title).toBe('Лабораторная работа 1');
    });

    it('finds lab submission for a student', async () => {
      const submission = await repo.findLabSubmission('student-001', 'lab-001');
      expect(submission).not.toBeNull();
      expect(submission!.status).toBe('graded');
    });

    it('returns null for unsubmitted lab', async () => {
      const submission = await repo.findLabSubmission('student-001', 'nonexistent');
      expect(submission).toBeNull();
    });
  });
});
