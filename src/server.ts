import http from 'http';
import { initWebSocketServer } from './ws/wsServer.js';

export function startServer() {
  const server = http.createServer();

  initWebSocketServer(server);

  server.listen(8080, () => {
    console.log('Server running on port 8080');
  });
}
