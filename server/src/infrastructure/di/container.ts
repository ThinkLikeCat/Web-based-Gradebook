import { config } from '../../config';
import { InMemoryGradebookRepository } from '../database/repositories/InMemoryGradebookRepository';
import { getPool } from '../database/postgres/connection';
import { PostgresAuthRepository } from '../database/postgres/repositories/PostgresAuthRepository';
import { PostgresSessionRepository } from '../database/postgres/repositories/PostgresSessionRepository';
import { PostgresStudentReadRepository } from '../database/postgres/repositories/PostgresStudentReadRepository';
import { PostgresTeacherAccessRepository } from '../database/postgres/repositories/PostgresTeacherAccessRepository';
import { PostgresTeacherJournalRepository } from '../database/postgres/repositories/PostgresTeacherJournalRepository';
import { PostgresTeacherProgramRepository } from '../database/postgres/repositories/PostgresTeacherProgramRepository';
import { AuthUseCaseImpl } from '../../application/usecases/auth.usecase';
import { TeacherUseCaseImpl } from '../../application/usecases/teacher.usecase';
import { StudentUseCaseImpl } from '../../application/usecases/student.usecase';
import { AuthController } from '../../interfaces/controllers/auth.controller';
import { TeacherController } from '../../interfaces/controllers/teacher.controller';
import { StudentController } from '../../interfaces/controllers/student.controller';

function buildRepositories() {
  if (config.useDatabase) {
    const pool = getPool();
    return {
      authRepo: new PostgresAuthRepository(pool),
      sessionRepo: new PostgresSessionRepository(pool),
      studentReadRepo: new PostgresStudentReadRepository(pool),
      teacherAccessRepo: new PostgresTeacherAccessRepository(pool),
      teacherJournalRepo: new PostgresTeacherJournalRepository(pool),
      teacherProgramRepo: new PostgresTeacherProgramRepository(pool),
    };
  }

  const mem = new InMemoryGradebookRepository();
  return {
    authRepo: mem,
    sessionRepo: mem,
    studentReadRepo: mem,
    teacherAccessRepo: mem,
    teacherJournalRepo: mem,
    teacherProgramRepo: mem,
  };
}

const repos = buildRepositories();

export const authUseCase = new AuthUseCaseImpl(repos.authRepo, repos.sessionRepo);
export const teacherUseCase = new TeacherUseCaseImpl(repos.teacherAccessRepo, repos.teacherJournalRepo, repos.teacherProgramRepo);
export const studentUseCase = new StudentUseCaseImpl(repos.studentReadRepo);

export const authController = new AuthController(authUseCase);
export const teacherController = new TeacherController(teacherUseCase);
export const studentController = new StudentController(studentUseCase);
