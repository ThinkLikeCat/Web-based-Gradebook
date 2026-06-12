import { Router } from 'express';
import { getStudentController } from '../../di/container';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

function c() { return getStudentController(); }

router.get('/students/:id/schedule', requireRole(['STUDENT', 'TEACHER']), (req, res, next) => c().getSchedule(req, res, next));
router.get('/students/:id/journal', requireRole(['STUDENT', 'TEACHER']), (req, res, next) => c().getJournal(req, res, next));
router.get('/students/:id/subjects/:subjectId', requireRole(['STUDENT', 'TEACHER']), (req, res, next) => c().getSubjectProgress(req, res, next));
router.get('/students/:id/labs/:labId', requireRole(['STUDENT', 'TEACHER']), (req, res, next) => c().getLabDetails(req, res, next));

export default router;
