import { Router } from 'express';
import { teacherController } from '../../di/container';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { setGradeSchema, setAttendanceSchema, addLessonSchema, addProgramItemSchema, gradeSubmissionSchema } from '../validation/schemas';

const router = Router();

router.use(authMiddleware);

router.get('/teacher/groups', requireRole(['TEACHER']), teacherController.getTeacherGroups.bind(teacherController));
router.get('/teacher/journal/:groupId/:subjectId', requireRole(['TEACHER']), teacherController.getJournal.bind(teacherController));
router.post('/teacher/grade', requireRole(['TEACHER']), validate(setGradeSchema), teacherController.setGrade.bind(teacherController));
router.post('/teacher/attendance', requireRole(['TEACHER']), validate(setAttendanceSchema), teacherController.setAttendance.bind(teacherController));
router.post('/teacher/lesson', requireRole(['TEACHER']), validate(addLessonSchema), teacherController.addLesson.bind(teacherController));
router.get('/teacher/program/:subjectId', requireRole(['TEACHER']), teacherController.getProgram.bind(teacherController));
router.post('/teacher/program', requireRole(['TEACHER']), validate(addProgramItemSchema), teacherController.addProgramItem.bind(teacherController));
router.put('/teacher/program/:itemId', requireRole(['TEACHER']), teacherController.updateProgramItem.bind(teacherController));
router.delete('/teacher/program/:itemId', requireRole(['TEACHER']), teacherController.deleteProgramItem.bind(teacherController));
router.get('/teacher/labs/:programId/submissions', requireRole(['TEACHER']), teacherController.getLabSubmissions.bind(teacherController));
router.post('/teacher/labs/submissions/:submissionId/grade', requireRole(['TEACHER']), validate(gradeSubmissionSchema), teacherController.gradeLabSubmission.bind(teacherController));

export default router;
