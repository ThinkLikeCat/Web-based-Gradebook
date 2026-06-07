import { Request, Response } from 'express';
import { StudentUseCaseImpl } from '../../application/usecases/student.usecase';
import { InMemoryStudentRepository } from '../../infrastructure/database/repositories/in-memory-student.repository';

const studentUseCase = new StudentUseCaseImpl(new InMemoryStudentRepository());

export class StudentController {
  async getSchedule(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const schedule = await studentUseCase.getSchedule(studentId);
      res.json(schedule);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async getJournal(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const journal = await studentUseCase.getJournal(studentId);
      res.json(journal);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async getSubjectProgress(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const subjectId = req.params.subjectId;
      const subjectProgress = await studentUseCase.getSubjectProgress(studentId, subjectId);
      res.json(subjectProgress);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async getLabDetails(req: Request, res: Response) {
    try {
      const studentId = req.params.id;
      const labId = req.params.labId;
      const labDetails = await studentUseCase.getLabDetails(studentId, labId);
      res.json(labDetails);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }
}
