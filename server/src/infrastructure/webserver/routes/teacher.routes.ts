import { Router } from 'express';
import { TeacherController } from '../../../interfaces/controllers/teacher.controller';
import { TeacherUseCaseImpl } from '../../../application/usecases/teacher.usecase';
import { InMemoryTeacherRepository } from '../../database/repositories/in-memory-teacher.repository';
import { authMiddleware, requireRole } from '../middleware/auth';

const teacherRepository = new InMemoryTeacherRepository();
const teacherUseCase = new TeacherUseCaseImpl(teacherRepository);
const controller = new TeacherController(teacherUseCase);

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['TEACHER']));

router.get('/teacher/groups', controller.getTeacherGroups.bind(controller));
router.get('/teacher/journal/:groupId/:subjectId', controller.getJournal.bind(controller));
router.post('/teacher/grade', controller.setGrade.bind(controller));
router.post('/teacher/attendance', controller.setAttendance.bind(controller));
router.post('/teacher/lesson', controller.addLesson.bind(controller));
router.get('/teacher/program/:subjectId', controller.getProgram.bind(controller));
router.post('/teacher/program', controller.addProgramItem.bind(controller));
router.put('/teacher/program/:itemId', controller.updateProgramItem.bind(controller));
router.delete('/teacher/program/:itemId', controller.deleteProgramItem.bind(controller));
router.get('/teacher/labs/:programId/submissions', controller.getLabSubmissions.bind(controller));
router.post('/teacher/labs/submissions/:submissionId/grade', controller.gradeLabSubmission.bind(controller));

export default router;