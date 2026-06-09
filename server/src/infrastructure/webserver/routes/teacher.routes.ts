import { Router } from 'express';
import { TeacherController } from '../../../interfaces/controllers/teacher.controller';
import { TeacherUseCaseImpl } from '../../../application/usecases/teacher.usecase';
import { InMemoryGradebookRepository } from '../../database/repositories/InMemoryGradebookRepository';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { setGradeSchema, setAttendanceSchema, addLessonSchema, addProgramItemSchema, gradeSubmissionSchema } from '../validation/schemas';

const repository = new InMemoryGradebookRepository();
const teacherUseCase = new TeacherUseCaseImpl(repository, repository, repository);
const controller = new TeacherController(teacherUseCase);

const router = Router();

router.use(authMiddleware);

router.get('/teacher/groups', requireRole(['TEACHER']), controller.getTeacherGroups.bind(controller));
router.get('/teacher/journal/:groupId/:subjectId', requireRole(['TEACHER']), controller.getJournal.bind(controller));
router.post('/teacher/grade', requireRole(['TEACHER']), validate(setGradeSchema), controller.setGrade.bind(controller));
router.post('/teacher/attendance', requireRole(['TEACHER']), validate(setAttendanceSchema), controller.setAttendance.bind(controller));
router.post('/teacher/lesson', requireRole(['TEACHER']), validate(addLessonSchema), controller.addLesson.bind(controller));
router.get('/teacher/program/:subjectId', requireRole(['TEACHER']), controller.getProgram.bind(controller));
router.post('/teacher/program', requireRole(['TEACHER']), validate(addProgramItemSchema), controller.addProgramItem.bind(controller));
router.put('/teacher/program/:itemId', requireRole(['TEACHER']), controller.updateProgramItem.bind(controller));
router.delete('/teacher/program/:itemId', requireRole(['TEACHER']), controller.deleteProgramItem.bind(controller));
router.get('/teacher/labs/:programId/submissions', requireRole(['TEACHER']), controller.getLabSubmissions.bind(controller));
router.post('/teacher/labs/submissions/:submissionId/grade', requireRole(['TEACHER']), validate(gradeSubmissionSchema), controller.gradeLabSubmission.bind(controller));

export default router;
