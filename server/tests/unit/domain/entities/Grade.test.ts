import { Grade } from '../../../../src/domain/entities/Grade';
import { ValidationError } from '../../../../src/domain/errors/ValidationError';

describe('Grade entity', () => {
  const validProps = () => ['student-1', 'subject-1', 8, 'lab', '2026-06-01'] as const;

  it('creates a grade with valid data', () => {
    const g = new Grade(...validProps());
    expect(g.studentId).toBe('student-1');
    expect(g.subjectId).toBe('subject-1');
    expect(g.value).toBe(8);
    expect(g.type).toBe('lab');
    expect(g.date).toBe('2026-06-01');
  });

  it.each([1, 5, 10])('accepts value %i', (v) => {
    expect(() => new Grade('s', 'sub', v, 'test', '2026-01-01')).not.toThrow();
  });

  it.each([0, 11, -1])('rejects invalid value %i', (v) => {
    expect(() => new Grade('s', 'sub', v, 'test', '2026-01-01')).toThrow(ValidationError);
  });

  it.each(['', ' '])('rejects empty studentId', (id) => {
    expect(() => new Grade(id, 'sub', 5, 'test', '2026-01-01')).toThrow(ValidationError);
  });

  it.each(['', ' '])('rejects empty subjectId', (id) => {
    expect(() => new Grade('s', id, 5, 'test', '2026-01-01')).toThrow(ValidationError);
  });

  it.each(['', ' '])('rejects empty date', (d) => {
    expect(() => new Grade('s', 'sub', 5, 'test', d)).toThrow(ValidationError);
  });
});
