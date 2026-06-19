import { ValidationError } from '../../domain/errors/ValidationError';

export class GradeValue {
  private constructor(private readonly value: number) {}
  
  static create(value: number): GradeValue {
    if (value < 1 || value > 10) {
      throw new ValidationError('Оценка должна быть от 1 до 10');
    }
    if (!Number.isInteger(value)) {
      throw new ValidationError('Оценка должна быть целым числом');
    }
    return new GradeValue(value);
  }
  
  getValue(): number {
    return this.value;
  }
}