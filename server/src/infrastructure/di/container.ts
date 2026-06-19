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
import type { AuthUseCase } from '../../application/ports/in/auth.usecase';
import type { TeacherUseCase } from '../../application/ports/in/teacher.usecase';
import type { StudentUseCase } from '../../application/ports/in/student.usecase';

let _authUseCase: AuthUseCase;
let _teacherUseCase: TeacherUseCase;
let _studentUseCase: StudentUseCase;
let _authController: AuthController;
let _teacherController: TeacherController;
let _studentController: StudentController;
let _initialized = false;

function ensureInit() {
  if (_initialized) return;
  const pool = getPool();
  _authUseCase = new AuthUseCaseImpl(new PostgresAuthRepository(pool), new PostgresSessionRepository(pool));
  _teacherUseCase = new TeacherUseCaseImpl(new PostgresTeacherAccessRepository(pool), new PostgresTeacherJournalRepository(pool), new PostgresTeacherProgramRepository(pool));
  _studentUseCase = new StudentUseCaseImpl(new PostgresStudentReadRepository(pool));
  _authController = new AuthController(_authUseCase);
  _teacherController = new TeacherController(_teacherUseCase);
  _studentController = new StudentController(_studentUseCase);
  _initialized = true;
}

export function getAuthController(): AuthController { ensureInit(); return _authController; }
export function getTeacherController(): TeacherController { ensureInit(); return _teacherController; }
export function getStudentController(): StudentController { ensureInit(); return _studentController; }
