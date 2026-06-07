import { Router } from 'express';
import { StudentController } from '../../../interfaces/controllers/student.controller';

const router = Router();
const controller = new StudentController();

router.get('/students/:id/schedule', controller.getSchedule.bind(controller));
router.get('/students/:id/journal', controller.getJournal.bind(controller));
router.get('/students/:id/subjects/:subjectId', controller.getSubjectProgress.bind(controller));
router.get('/students/:id/labs/:labId', controller.getLabDetails.bind(controller));

export default router;
