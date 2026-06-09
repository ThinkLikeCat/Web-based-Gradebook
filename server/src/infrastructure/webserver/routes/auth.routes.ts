import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-secret-key';

// In-Memory пользователи
const users = [
  { 
    id: 1, 
    fullName: 'Вольфович', 
    birthDate: '2007-11-08', 
    role: 'STUDENT',
    groupId: 'group-1'
  },
  { 
    id: 2, 
    fullName: 'Вольфович', 
    password: 'Login123$',
    role: 'TEACHER' 
  },
];

router.post('/auth/login', async (req: Request, res: Response) => {
  const { fullName, password, birthDate } = req.body;
  
  const user = users.find(u => u.fullName === fullName);
  
  if (!user) {
    res.status(401).json({ error: 'Неверные данные' });
    return;
  }
  
  if (user.role === 'STUDENT') {
    if (!birthDate || user.birthDate !== birthDate) {
      res.status(401).json({ error: 'Неверные данные' });
      return;
    }
  } else {
    if (password !== user.password) {
      res.status(401).json({ error: 'Неверные данные' });
      return;
    }
  }
  
  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      groupId: user.role === 'STUDENT' ? (user as any).groupId : undefined,
    },
  });
});

export default router;