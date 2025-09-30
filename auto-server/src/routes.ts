import { Router } from 'express';
import { Users } from './db.js';
import { verifyPassword, signJWT } from './security.js';
import { requireAuth, requireRole } from './middleware.js';
import { GPIO } from './gpio.js';
import { proxyVideo } from './videoProxy.js';
import type { Direction, LightsState } from './types.js';

export const routes = Router();

routes.get('/health', (_req, res) => res.json({ ok: true }));

routes.post('/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });
  const user = Users.findByUsername(username);
  if (!user || !verifyPassword(password, (user as any).password_hash)) return res.status(401).json({ error: 'Credenciales inválidas' });
  const token = signJWT({ sub: (user as any).id, username: (user as any).username, role: (user as any).role }, '2h');
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 2 * 60 * 60 * 1000 });
  res.json({ token });
});

routes.post('/auth/logout', (_req, res) => { res.clearCookie('token'); res.json({ ok: true }); });

routes.post('/control/move', requireAuth, async (req, res) => {
  const { direction, speed } = req.body as { direction: Direction; speed: number };
  if (!direction || typeof speed !== 'number') return res.status(400).json({ error: 'Payload inválido' });
  await GPIO.setMotor(direction, Math.max(0, Math.min(100, speed)));
  res.json({ ok: true });
});

routes.post('/control/lights', requireAuth, async (req, res) => {
  const state = req.body as LightsState;
  if (!state) return res.status(400).json({ error: 'Payload inválido' });
  await GPIO.setLights({ front: !!state.front, rear: !!state.rear, left: !!state.left, right: !!state.right });
  res.json({ ok: true });
});

routes.get('/video/stream', proxyVideo);

export default routes;

// Registro de usuarios (solo admin)
routes.post('/auth/register', requireAuth, requireRole('admin'), (req, res) => {
  const { username, password, role } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });
  if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Tipos inválidos' });
  if (username.length < 3 || username.length > 32) return res.status(400).json({ error: 'username debe tener 3-32 caracteres' });
  if (password.length < 8) return res.status(400).json({ error: 'password mínimo 8 caracteres' });
  const exists = Users.findByUsername(username);
  if (exists) return res.status(409).json({ error: 'Usuario ya existe' });
  const userRole = role === 'admin' ? 'admin' : 'user';
  Users.create(username, password, userRole);
  return res.status(201).json({ ok: true, user: { username, role: userRole } });
});

// Listado de usuarios (solo admin)
routes.get('/users', requireAuth, requireRole('admin'), (_req, res) => {
  const list = Users.list();
  res.json({ users: list });
});
