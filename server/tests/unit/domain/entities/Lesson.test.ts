import { Lesson } from '../../../../src/domain/entities/Lesson';
import { ValidationError } from '../../../../src/domain/errors/ValidationError';

describe('Lesson entity', () => {
  it('creates a lesson with string IDs', () => {
    const l = new Lesson('lesson-1', 'subject-1', 'group-1', '2026-06-01', '09:00', '10:30');
    expect(l.id).toBe('lesson-1');
    expect(l.subjectId).toBe('subject-1');
    expect(l.groupId).toBe('group-1');
    expect(l.date).toBe('2026-06-01');
    expect(l.startTime).toBe('09:00');
    expect(l.endTime).toBe('10:30');
  });

  it.each(['', ' '])('rejects empty id', (id) => {
    expect(() => new Lesson(id, 'sub', 'grp', '2026-01-01', '09:00', '10:00')).toThrow(ValidationError);
  });

  it.each(['', ' '])('rejects empty subjectId', (id) => {
    expect(() => new Lesson('l1', id, 'grp', '2026-01-01', '09:00', '10:00')).toThrow(ValidationError);
  });

  it.each(['', ' '])('rejects empty groupId', (id) => {
    expect(() => new Lesson('l1', 'sub', id, '2026-01-01', '09:00', '10:00')).toThrow(ValidationError);
  });
});
