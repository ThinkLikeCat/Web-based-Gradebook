import { Request, Response } from 'express';
import { TeacherUseCase } from '../../application/ports/in/teacher.usecase';
import { asyncHandler } from '../../infrastructure/webserver/middleware/errorHandler';

export class TeacherController {
  constructor(private readonly teacherUseCase: TeacherUseCase) {}

  getTeacherGroups = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const groups = await this.teacherUseCase.getTeacherGroups(teacherId);
    res.json(groups);
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const stats = await this.teacherUseCase.getTeacherStats(teacherId);
    res.json(stats);
  });

  getJournal = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { groupId, subjectId } = req.params;
    const journal = await this.teacherUseCase.getJournal(teacherId, groupId, subjectId);
    res.json(journal);
  });

  setGrade = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { studentId, lessonId, value, type } = req.body;
    await this.teacherUseCase.setGrade(teacherId, { studentId, lessonId, value, type });
    res.status(200).json({ message: 'Grade saved successfully' });
  });

  setAttendance = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { studentId, lessonId, status } = req.body;
    await this.teacherUseCase.setAttendance(teacherId, { studentId, lessonId, status });
    res.status(200).json({ message: 'Attendance saved successfully' });
  });

  addLesson = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { subjectId, groupId, date, startTime, endTime } = req.body;
    await this.teacherUseCase.addLesson(teacherId, { subjectId, groupId, date, startTime, endTime });
    res.status(201).json({ message: 'Lesson added successfully' });
  });

  getProgram = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { subjectId } = req.params;
    const program = await this.teacherUseCase.getProgram(teacherId, subjectId);
    res.json(program);
  });

  addProgramItem = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const data = req.body;
    const item = await this.teacherUseCase.addProgramItem(teacherId, data);
    res.status(201).json(item);
  });

  updateProgramItem = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { itemId } = req.params;
    const data = req.body;
    await this.teacherUseCase.updateProgramItem(teacherId, itemId, data);
    res.status(200).json({ message: 'Program item updated' });
  });

  deleteProgramItem = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { itemId } = req.params;
    await this.teacherUseCase.deleteProgramItem(teacherId, itemId);
    res.status(200).json({ message: 'Program item deleted' });
  });

  getLabSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { programId } = req.params;
    const submissions = await this.teacherUseCase.getLabSubmissions(teacherId, programId);
    res.json(submissions);
  });

  gradeLabSubmission = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const { submissionId } = req.params;
    const { grade, comment } = req.body;
    await this.teacherUseCase.gradeLabSubmission(teacherId, submissionId, { grade, comment });
    res.status(200).json({ message: 'Submission graded' });
  });
}
