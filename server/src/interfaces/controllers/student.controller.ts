import { Request, Response } from 'express';
import { StudentUseCase } from '../../application/ports/in/student.usecase';
import { asyncHandler } from '../../infrastructure/webserver/middleware/errorHandler';

export class StudentController {
  constructor(private readonly studentUseCase: StudentUseCase) {}

  getSchedule = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.id;
    const schedule = await this.studentUseCase.getSchedule(studentId);
    res.json(schedule);
  });

  getJournal = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.id;
    const journal = await this.studentUseCase.getJournal(studentId);
    res.json(journal);
  });

  getSubjectProgress = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.id;
    const subjectId = req.params.subjectId;
    const subjectProgress = await this.studentUseCase.getSubjectProgress(studentId, subjectId);
    res.json(subjectProgress);
  });

  getLabDetails = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.id;
    const labId = req.params.labId;
    const labDetails = await this.studentUseCase.getLabDetails(studentId, labId);
    res.json(labDetails);
  });
}
