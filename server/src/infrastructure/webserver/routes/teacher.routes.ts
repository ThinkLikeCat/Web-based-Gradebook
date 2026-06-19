import { Router } from 'express';
import { getTeacherController } from '../../di/container';
import { authMiddleware, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { setGradeSchema, setAttendanceSchema, addLessonSchema, addProgramItemSchema, gradeSubmissionSchema } from '../validation/schemas';

const router = Router();

router.use(authMiddleware);

function c() { return getTeacherController(); }

router.get('/teacher/groups', requireRole(['TEACHER']), (req, res, next) => c().getTeacherGroups(req, res, next));
router.get('/teacher/stats', requireRole(['TEACHER']), (req, res, next) => c().getStats(req, res, next));
router.get('/teacher/journal/:groupId/:subjectId', requireRole(['TEACHER']), (req, res, next) => c().getJournal(req, res, next));
router.post('/teacher/grade', requireRole(['TEACHER']), validate(setGradeSchema), (req, res, next) => c().setGrade(req, res, next));
router.post('/teacher/attendance', requireRole(['TEACHER']), validate(setAttendanceSchema), (req, res, next) => c().setAttendance(req, res, next));
router.post('/teacher/lesson', requireRole(['TEACHER']), validate(addLessonSchema), (req, res, next) => c().addLesson(req, res, next));
router.get('/teacher/program/:subjectId', requireRole(['TEACHER']), (req, res, next) => c().getProgram(req, res, next));
router.post('/teacher/program', requireRole(['TEACHER']), validate(addProgramItemSchema), (req, res, next) => c().addProgramItem(req, res, next));
router.put('/teacher/program/:itemId', requireRole(['TEACHER']), (req, res, next) => c().updateProgramItem(req, res, next));
router.delete('/teacher/program/:itemId', requireRole(['TEACHER']), (req, res, next) => c().deleteProgramItem(req, res, next));
router.get('/teacher/labs/:programId/submissions', requireRole(['TEACHER']), (req, res, next) => c().getLabSubmissions(req, res, next));
router.post('/teacher/labs/submissions/:submissionId/grade', requireRole(['TEACHER']), validate(gradeSubmissionSchema), (req, res, next) => c().gradeLabSubmission(req, res, next));

export default router;
