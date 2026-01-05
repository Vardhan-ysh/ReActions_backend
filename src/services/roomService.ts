import { redis } from "../redis/redisClient.js";
import { generateRoomCode } from "../utils/roomCode.js";
import { createRoom, addPlayerToRoom } from "../game/roomManager.js";
import { setRoom, Connection } from "../ws/connectionRegistry.js";
import { broadcast } from "../ws/wsServer.js";
import { BroadcastType, RoomCreatedResponse, WebSocketResponse } from "../types/ws.js";

const ROOM_CODE_TTL_SECONDS = 600;

export async function createRoomAndJoin(connection: Connection, name: string) {
  const roomId = crypto.randomUUID();

  let roomCode: string;
  let exists: boolean;

  do {
    roomCode = generateRoomCode();
    exists = Boolean(await redis.get(`room:code:${roomCode}`));
  } while (exists);

  await redis.set(`room:code:${roomCode}`, roomId, "EX", ROOM_CODE_TTL_SECONDS);

  const room = createRoom(roomId);

  addPlayerToRoom(room, connection.playerId, name);

  setRoom(connection.playerId, roomId);

  const response: RoomCreatedResponse = {
    type: BroadcastType.ROOM_CREATED,
    payload: {
      roomId,
      roomCode,
      playerId: connection.playerId,
    },
  };

  connection.socket.send(JSON.stringify(response));
}
