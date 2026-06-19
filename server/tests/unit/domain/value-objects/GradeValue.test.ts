import { GradeValue } from '../../../../src/domain/value-objects/GradeValue';
import { ValidationError } from '../../../../src/domain/errors/ValidationError';

describe('GradeValue', () => {
  it.each([1, 5, 10])('creates value %i', (v) => {
    const gv = GradeValue.create(v);
    expect(gv.getValue()).toBe(v);
  });

  it.each([0, 11, -1])('rejects out-of-range value %i', (v) => {
    expect(() => GradeValue.create(v)).toThrow(ValidationError);
  });

  it.each([1.5, 2.7, 9.9])('rejects non-integer value %f', (v) => {
    expect(() => GradeValue.create(v)).toThrow(ValidationError);
  });
});
