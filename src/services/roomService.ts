import { redis } from "../redis/redisClient.js";
import { generateRoomCode } from "../utils/roomCode.js";
import { createRoom, addPlayerToRoom, getRoom } from "../game/roomManager.js";
import { setRoom, Connection, getConnection } from "../ws/connectionRegistry.js";
import { BroadcastType, RoomCreatedResponse, WebSocketResponse } from "../types/ws.js";
import { startGameIfReady } from "../game/gameManager.js";


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

export async function joinRoomByCode(
  connection: Connection,
  name: string,
  code: string
) {
  const roomId = await redis.get(`room:code:${code}`);

  if (!roomId) {
    connection.socket.send(
      JSON.stringify({
        type: BroadcastType.ERROR,
        payload: { message: "Invalid or expired room code" },
      })
    );
    return;
  }

  const room = getRoom(roomId);

  if (!room) {
    await redis.del(`room:code:${code}`);

    connection.socket.send(
      JSON.stringify({
        type: BroadcastType.ERROR,
        payload: { message: "Room no longer exists" },
      })
    );
    return;
  }

  if (room.players.length >= 2) {
    connection.socket.send(
      JSON.stringify({
        type: BroadcastType.ERROR,
        payload: { message: "Room is already full" },
      })
    );
    return;
  }

  addPlayerToRoom(room, connection.playerId, name);
  setRoom(connection.playerId, roomId);

  await redis.del(`room:code:${code}`);

  const response: WebSocketResponse = {
    type: BroadcastType.JOINED,
    payload: {
      roomId,
      playerId: connection.playerId,
    },
  };

  connection.socket.send(JSON.stringify(response));

  startGameIfReady(room);
}

const MATCHMAKING_KEY = "matchmaking:waiting";

export async function findMatch(
  connection: Connection,
  name: string
) {
  const waitingData = await redis.get(MATCHMAKING_KEY);

  if (!waitingData) {
    await redis.set(
      MATCHMAKING_KEY,
      JSON.stringify({ playerId: connection.playerId, name })
    );

    connection.socket.send(
      JSON.stringify({
        type: BroadcastType.MATCH_WAITING,
        payload: { message: "Waiting for opponent..." },
      })
    );

    return;
  }

  let waitingPlayerId: string;
  let waitingPlayerName: string;

  try {
    const parsed = JSON.parse(waitingData);
    waitingPlayerId = parsed.playerId;
    waitingPlayerName = parsed.name;
  } catch {
    // Handle legacy case where only string ID was stored
    waitingPlayerId = waitingData;
    waitingPlayerName = "Player";
  }

  if (waitingPlayerId === connection.playerId) {
    return;
  }

  await redis.del(MATCHMAKING_KEY);

  const roomId = crypto.randomUUID();
  const room = createRoom(roomId);

  const waitingConn = getConnection(waitingPlayerId);
  if (waitingConn) {
    addPlayerToRoom(room, waitingPlayerId, waitingPlayerName);
    setRoom(waitingPlayerId, roomId);
  }

  addPlayerToRoom(room, connection.playerId, name);
  setRoom(connection.playerId, roomId);

  room.players.forEach((p) => {
    const conn = getConnection(p.playerId);
    if (conn) {
      conn.socket.send(
        JSON.stringify({
          type: BroadcastType.JOINED,
          payload: {
            roomId,
            playerId: p.playerId,
          },
        })
      );
    }
  });

  startGameIfReady(room);
}
