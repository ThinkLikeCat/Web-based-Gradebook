import { Router } from 'express';
import { StudentController } from '../../../interfaces/controllers/student.controller';
import { StudentUseCaseImpl } from '../../../application/usecases/student.usecase';
import { InMemoryGradebookRepository } from '../../database/repositories/InMemoryGradebookRepository';
import { authMiddleware, requireRole } from '../middleware/auth';

const repository = new InMemoryGradebookRepository();
const studentUseCase = new StudentUseCaseImpl(repository);
const controller = new StudentController(studentUseCase);

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['STUDENT', 'TEACHER']));

router.get('/students/:id/schedule', controller.getSchedule.bind(controller));
router.get('/students/:id/journal', controller.getJournal.bind(controller));
router.get('/students/:id/subjects/:subjectId', controller.getSubjectProgress.bind(controller));
router.get('/students/:id/labs/:labId', controller.getLabDetails.bind(controller));

export default router;
