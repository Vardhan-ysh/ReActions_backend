import type { Connection } from './connectionRegistry.js';

interface WSMessage {
  type: string;
  payload?: any;
}

export function handleMessage(connection: Connection, raw: string) {
  let message: WSMessage;

  try {
    message = JSON.parse(raw);
  } catch {
    return;
  }

  switch (message.type) {
    case 'TEST':
      connection.socket.send(JSON.stringify({ type: 'CONNECTED' }));
      break;

    case 'JOIN_GAME':
      // will call gameManager.join()
      console.log('JOIN_GAME from', connection.playerId);
      break;

    case 'CHAT_MESSAGE':
      // chatHandler later
      break;

    case 'PLAYER_ACTION':
      // gameManager.handleAction later
      break;

    default:
      console.warn('Unknown message', message.type);
  }
}
