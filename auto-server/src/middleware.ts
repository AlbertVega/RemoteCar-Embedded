import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const baseMiddleware = [
  cors({ origin: config.allowedOrigin === '*' ? true : config.allowedOrigin, credentials: true }),
  cookieParser(),
  rateLimit({ windowMs: 60_000, max: 400 })
];

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = (req as any).cookies?.token || (req.headers.authorization?.split(' ')[1]);
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireRole(role: 'admin' | 'user') {
  return function (req: Request, res: Response, next: NextFunction) {
    const u: any = (req as any).user;
    if (!u || (role === 'admin' && u.role !== 'admin')) {
      return res.status(403).json({ error: 'Prohibido' });
    }
    next();
  };
}
