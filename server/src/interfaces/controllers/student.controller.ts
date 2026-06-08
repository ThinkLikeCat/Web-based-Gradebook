import { Request, Response } from 'express';
import { StudentUseCase } from '../../application/ports/in/student.usecase';
import { NotFoundError } from '../../domain/errors/NotFoundError';

export class StudentController {
  constructor(private readonly studentUseCase: StudentUseCase) {}

  async getSchedule(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const schedule = await this.studentUseCase.getSchedule(studentId);
      res.json(schedule);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getJournal(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const journal = await this.studentUseCase.getJournal(studentId);
      res.json(journal);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getSubjectProgress(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const subjectId = req.params.subjectId;
      const subjectProgress = await this.studentUseCase.getSubjectProgress(studentId, subjectId);
      res.json(subjectProgress);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getLabDetails(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const labId = req.params.labId;
      const labDetails = await this.studentUseCase.getLabDetails(studentId, labId);
      res.json(labDetails);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}
