import { Router } from 'express';
import { authController } from '../../di/container';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { registerStudentSchema, registerTeacherSchema, loginSchema, refreshTokenSchema } from '../validation/schemas';

const router = Router();

router.post('/auth/register/student', validate(registerStudentSchema), authController.registerStudent.bind(authController));
router.post('/auth/register/teacher', validate(registerTeacherSchema), authController.registerTeacher.bind(authController));
router.post('/auth/login', validate(loginSchema), authController.login.bind(authController));
router.post('/auth/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/auth/logout', authMiddleware, authController.logout.bind(authController));

export default router;
