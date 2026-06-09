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
router.use(requireRole(['TEACHER']));

router.get('/teacher/groups', controller.getTeacherGroups.bind(controller));
router.get('/teacher/journal/:groupId/:subjectId', controller.getJournal.bind(controller));
router.post('/teacher/grade', validate(setGradeSchema), controller.setGrade.bind(controller));
router.post('/teacher/attendance', validate(setAttendanceSchema), controller.setAttendance.bind(controller));
router.post('/teacher/lesson', validate(addLessonSchema), controller.addLesson.bind(controller));
router.get('/teacher/program/:subjectId', controller.getProgram.bind(controller));
router.post('/teacher/program', validate(addProgramItemSchema), controller.addProgramItem.bind(controller));
router.put('/teacher/program/:itemId', controller.updateProgramItem.bind(controller));
router.delete('/teacher/program/:itemId', controller.deleteProgramItem.bind(controller));
router.get('/teacher/labs/:programId/submissions', controller.getLabSubmissions.bind(controller));
router.post('/teacher/labs/submissions/:submissionId/grade', validate(gradeSubmissionSchema), controller.gradeLabSubmission.bind(controller));

export default router;
