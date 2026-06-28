import { createClient } from 'redis';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

dotenv.config()

export const pubClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_SOCKET_HOST,
        port: Number(process.env.REDIS_SOCKET_PORT)
    }
})

export const subClient = pubClient.duplicate()

export const connectRedisPubSubClients = async () => {
  await Promise.all([
    pubClient.connect(),
    subClient.connect()
  ])
  console.log("Redis publish client connected ✅")
  console.log("Redis subscribe client connected ✅")
}

export const initializeRedisAdapterToSocketIO = (io: Server) => {
  io.adapter(createAdapter(pubClient, subClient))
  console.log("Redis adapter for socket.io initialized ✅")
}