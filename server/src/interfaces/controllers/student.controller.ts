import { Request, Response } from 'express';
import { StudentUseCase } from '../../application/ports/in/student.usecase';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { ValidationError } from '../../domain/errors/ValidationError';

function handleControllerError(res: Response, error: unknown): void {
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
  } else if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
  } else {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message });
  }
}

export class StudentController {
  constructor(private readonly studentUseCase: StudentUseCase) {}

  async getSchedule(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const schedule = await this.studentUseCase.getSchedule(studentId);
      res.json(schedule);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  async getJournal(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const journal = await this.studentUseCase.getJournal(studentId);
      res.json(journal);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  async getSubjectProgress(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const subjectId = req.params.subjectId;
      const subjectProgress = await this.studentUseCase.getSubjectProgress(studentId, subjectId);
      res.json(subjectProgress);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  async getLabDetails(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const labId = req.params.labId;
      const labDetails = await this.studentUseCase.getLabDetails(studentId, labId);
      res.json(labDetails);
    } catch (error) {
      handleControllerError(res, error);
    }
  }
}
