import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db';
import { JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
  file?: Express.Multer.File;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    
    // Verify user still exists in DB
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(Number(decoded.id));
    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
