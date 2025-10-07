import httpProxy from 'http-proxy';
import { config } from './config.js';
const proxy = httpProxy.createProxyServer({});
export function proxyVideo(req, res) {
    proxy.web(req, res, { target: config.videoProxyUrl, changeOrigin: true }, () => {
        res.status(502).send('Video no disponible');
    });
}
