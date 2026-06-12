import { Router } from 'express';
import { getAuthController } from '../../di/container';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { registerStudentSchema, registerTeacherSchema, loginSchema, refreshTokenSchema } from '../validation/schemas';

const router = Router();

function c() { return getAuthController(); }

router.post('/auth/register/student', validate(registerStudentSchema), (req, res, next) => c().registerStudent(req, res, next));
router.post('/auth/register/teacher', validate(registerTeacherSchema), (req, res, next) => c().registerTeacher(req, res, next));
router.post('/auth/login', validate(loginSchema), (req, res, next) => c().login(req, res, next));
router.post('/auth/refresh', validate(refreshTokenSchema), (req, res, next) => c().refreshToken(req, res, next));
router.post('/auth/logout', authMiddleware, (req, res, next) => c().logout(req, res, next));

export default router;
