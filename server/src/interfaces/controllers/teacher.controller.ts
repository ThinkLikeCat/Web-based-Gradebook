import { Request, Response } from 'express';
import { TeacherUseCase } from '../../application/ports/in/teacher.usecase';
import { NotFoundError } from '../../domain/errors/NotFoundError';

export class TeacherController {
  constructor(private readonly teacherUseCase: TeacherUseCase) {}

  async getTeacherGroups(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const groups = await this.teacherUseCase.getTeacherGroups(teacherId);
      res.json(groups);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getJournal(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { groupId, subjectId } = req.params;
      const journal = await this.teacherUseCase.getJournal(teacherId, groupId, subjectId);
      res.json(journal);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async setGrade(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { studentId, lessonId, value, type } = req.body;
      await this.teacherUseCase.setGrade(teacherId, { studentId, lessonId, value, type });
      res.status(200).json({ message: 'Grade saved successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async setAttendance(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { studentId, lessonId, status } = req.body;
      await this.teacherUseCase.setAttendance(teacherId, { studentId, lessonId, status });
      res.status(200).json({ message: 'Attendance saved successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async addLesson(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { subjectId, groupId, date, startTime, endTime } = req.body;
      await this.teacherUseCase.addLesson(teacherId, { subjectId, groupId, date, startTime, endTime });
      res.status(201).json({ message: 'Lesson added successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProgram(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { subjectId } = req.params;
      const program = await this.teacherUseCase.getProgram(teacherId, subjectId);
      res.json(program);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async addProgramItem(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const data = req.body;
      const item = await this.teacherUseCase.addProgramItem(teacherId, data);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateProgramItem(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { itemId } = req.params;
      const data = req.body;
      await this.teacherUseCase.updateProgramItem(teacherId, itemId, data);
      res.status(200).json({ message: 'Program item updated' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteProgramItem(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { itemId } = req.params;
      await this.teacherUseCase.deleteProgramItem(teacherId, itemId);
      res.status(200).json({ message: 'Program item deleted' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getLabSubmissions(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { programId } = req.params;
      const submissions = await this.teacherUseCase.getLabSubmissions(teacherId, programId);
      res.json(submissions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async gradeLabSubmission(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const { submissionId } = req.params;
      const { grade, comment } = req.body;
      await this.teacherUseCase.gradeLabSubmission(teacherId, submissionId, { grade, comment });
      res.status(200).json({ message: 'Submission graded' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}