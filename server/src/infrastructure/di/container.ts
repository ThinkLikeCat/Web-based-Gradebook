import { InMemoryGradebookRepository } from '../database/repositories/InMemoryGradebookRepository';
import { AuthUseCaseImpl } from '../../application/usecases/auth.usecase';
import { TeacherUseCaseImpl } from '../../application/usecases/teacher.usecase';
import { StudentUseCaseImpl } from '../../application/usecases/student.usecase';
import { AuthController } from '../../interfaces/controllers/auth.controller';
import { TeacherController } from '../../interfaces/controllers/teacher.controller';
import { StudentController } from '../../interfaces/controllers/student.controller';

const repository = new InMemoryGradebookRepository();

export const authUseCase = new AuthUseCaseImpl(repository, repository);
export const teacherUseCase = new TeacherUseCaseImpl(repository, repository, repository);
export const studentUseCase = new StudentUseCaseImpl(repository);

export const authController = new AuthController(authUseCase);
export const teacherController = new TeacherController(teacherUseCase);
export const studentController = new StudentController(studentUseCase);
