import { Router } from 'express';
import { studentController } from '../../di/container';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/students/:id/schedule', requireRole(['STUDENT', 'TEACHER']), studentController.getSchedule.bind(studentController));
router.get('/students/:id/journal', requireRole(['STUDENT', 'TEACHER']), studentController.getJournal.bind(studentController));
router.get('/students/:id/subjects/:subjectId', requireRole(['STUDENT', 'TEACHER']), studentController.getSubjectProgress.bind(studentController));
router.get('/students/:id/labs/:labId', requireRole(['STUDENT', 'TEACHER']), studentController.getLabDetails.bind(studentController));

export default router;
