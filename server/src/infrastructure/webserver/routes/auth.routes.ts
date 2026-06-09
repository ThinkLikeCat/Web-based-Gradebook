import { Router } from 'express';
import { AuthController } from '../../../interfaces/controllers/auth.controller';
import { AuthUseCaseImpl } from '../../../application/usecases/auth.usecase';
import { InMemoryGradebookRepository } from '../../database/repositories/InMemoryGradebookRepository';
import { validate } from '../middleware/validate';
import { registerStudentSchema, registerTeacherSchema, loginSchema } from '../validation/schemas';

const repository = new InMemoryGradebookRepository();
const authUseCase = new AuthUseCaseImpl(repository);
const controller = new AuthController(authUseCase);

const router = Router();

router.post('/auth/register/student', validate(registerStudentSchema), controller.registerStudent.bind(controller));
router.post('/auth/register/teacher', validate(registerTeacherSchema), controller.registerTeacher.bind(controller));
router.post('/auth/login', validate(loginSchema), controller.login.bind(controller));

export default router;
