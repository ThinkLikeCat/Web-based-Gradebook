import { Request, Response } from 'express';
import { AuthUseCase } from '../../application/ports/in/auth.usecase';
import { asyncHandler } from '../../infrastructure/webserver/middleware/errorHandler';

export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  registerStudent = asyncHandler(async (req: Request, res: Response) => {
    const { lastName, firstName, birthDate, group, password } = req.body;
    const result = await this.authUseCase.registerStudent({ lastName, firstName, birthDate, group, password });
    res.status(201).json(result);
  });

  registerTeacher = asyncHandler(async (req: Request, res: Response) => {
    const { lastName, firstName, email, password } = req.body;
    const result = await this.authUseCase.registerTeacher({ lastName, firstName, email, password });
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, password } = req.body;
    const result = await this.authUseCase.login({ fullName, password });
    res.json(result);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await this.authUseCase.refreshToken({ refreshToken });
    res.json(result);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await this.authUseCase.logout(refreshToken);
    } else if (req.user) {
      await this.authUseCase.logoutAll(req.user.id);
    }
    res.json({ message: 'Выход выполнен' });
  });
}
