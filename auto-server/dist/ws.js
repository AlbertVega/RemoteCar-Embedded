import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { GPIO } from './gpio.js';
export function initWs(server) {
    const wss = new WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws, req) => {
        const token = new URL(req.url ?? '', 'http://x').searchParams.get('token') || '';
        try {
            jwt.verify(token, config.jwtSecret);
        }
        catch {
            ws.close(1008, 'No autorizado');
            return;
        }
        ws.on('message', async (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.type === 'move') {
                    const { direction, speed } = msg.payload;
                    await GPIO.setMotor(direction, speed);
                }
                else if (msg.type === 'lights') {
                    await GPIO.setLights(msg.payload);
                }
            }
            catch {
                // ignore
            }
        });
    });
    return wss;
}
