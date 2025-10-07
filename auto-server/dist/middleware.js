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
export function requireAuth(req, res, next) {
    const token = req.cookies?.token || (req.headers.authorization?.split(' ')[1]);
    if (!token)
        return res.status(401).json({ error: 'No autorizado' });
    try {
        const payload = jwt.verify(token, config.jwtSecret);
        req.user = payload;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
export function requireRole(role) {
    return function (req, res, next) {
        const u = req.user;
        if (!u || (role === 'admin' && u.role !== 'admin')) {
            return res.status(403).json({ error: 'Prohibido' });
        }
        next();
    };
}
