import { Router } from 'express';
import { StudentController } from '../../../interfaces/controllers/student.controller';
import { StudentUseCaseImpl } from '../../../application/usecases/student.usecase';
import { InMemoryStudentRepository } from '../../database/repositories/in-memory-student.repository';

const studentUseCase = new StudentUseCaseImpl(new InMemoryStudentRepository());
const controller = new StudentController(studentUseCase);

const router = Router();

router.get('/students/:id/schedule', controller.getSchedule.bind(controller));
router.get('/students/:id/journal', controller.getJournal.bind(controller));
router.get('/students/:id/subjects/:subjectId', controller.getSubjectProgress.bind(controller));
router.get('/students/:id/labs/:labId', controller.getLabDetails.bind(controller));

export default router;
