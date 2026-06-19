import { Attendance } from '../../../../src/domain/entities/Attendance';
import { ValidationError } from '../../../../src/domain/errors/ValidationError';

describe('Attendance entity', () => {
  it('creates attendance with PRESENT status', () => {
    const a = new Attendance('s1', 'sub1', '2026-06-01', 'PRESENT');
    expect(a.studentId).toBe('s1');
    expect(a.status).toBe('PRESENT');
  });

  it('creates attendance with LATE status', () => {
    const a = new Attendance('s1', 'sub1', '2026-06-01', 'LATE');
    expect(a.status).toBe('LATE');
  });

  it('creates attendance with ABSENT status', () => {
    const a = new Attendance('s1', 'sub1', '2026-06-01', 'ABSENT');
    expect(a.status).toBe('ABSENT');
  });

  it.each(['present', 'absent', 'late', 'UNKNOWN', ''])('rejects status "%s"', (status) => {
    expect(() => new Attendance('s1', 'sub1', '2026-06-01', status as any)).toThrow(ValidationError);
  });

  it.each(['', ' '])('rejects empty studentId', (id) => {
    expect(() => new Attendance(id, 'sub', '2026-01-01', 'PRESENT')).toThrow(ValidationError);
  });

  it.each(['', ' '])('rejects empty subjectId', (id) => {
    expect(() => new Attendance('s', id, '2026-01-01', 'PRESENT')).toThrow(ValidationError);
  });

  it.each(['', ' '])('rejects empty date', (d) => {
    expect(() => new Attendance('s', 'sub', d, 'PRESENT')).toThrow(ValidationError);
  });
});
