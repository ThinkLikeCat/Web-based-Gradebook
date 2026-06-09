import { Request, Response } from 'express';
import { AuthUseCase } from '../../application/ports/in/auth.usecase';
import { ValidationError } from '../../domain/errors/ValidationError';
import { NotFoundError } from '../../domain/errors/NotFoundError';

function handleControllerError(res: Response, error: unknown): void {
  if (error instanceof NotFoundError) {
    res.status(401).json({ error: error.message });
  } else if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
  } else {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
}

export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  async registerStudent(req: Request, res: Response): Promise<void> {
    try {
      const { lastName, firstName, birthDate, group, password } = req.body;
      const result = await this.authUseCase.registerStudent({ lastName, firstName, birthDate, group, password });
      res.status(201).json(result);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  async registerTeacher(req: Request, res: Response): Promise<void> {
    try {
      const { lastName, firstName, email, password } = req.body;
      const result = await this.authUseCase.registerTeacher({ lastName, firstName, email, password });
      res.status(201).json(result);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, password, birthDate } = req.body;
      const result = await this.authUseCase.login({ fullName, password, birthDate });
      res.json(result);
    } catch (error) {
      handleControllerError(res, error);
    }
  }
}
