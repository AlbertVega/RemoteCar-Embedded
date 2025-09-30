import { WebSocketServer } from 'ws';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { GPIO } from './gpio.js';
import type { Direction, LightsState } from './types.js';

export function initWs(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const token = new URL(req.url ?? '', 'http://x').searchParams.get('token') || '';
    try { jwt.verify(token, config.jwtSecret); }
    catch { ws.close(1008, 'No autorizado'); return; }

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'move') {
          const { direction, speed } = msg.payload as { direction: Direction; speed: number };
          await GPIO.setMotor(direction, speed);
        } else if (msg.type === 'lights') {
          await GPIO.setLights(msg.payload as LightsState);
        }
      } catch {
        // ignore
      }
    });
  });

  return wss;
}
