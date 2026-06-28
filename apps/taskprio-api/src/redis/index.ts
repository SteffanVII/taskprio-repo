import { createClient } from 'redis';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

dotenv.config()

const PORT = Number(process.env.REDIS_SOCKET_PORT);
const PASSWORD = process.env.REDIS_PASSWORD;
const USERNAME = process.env.REDIS_USERNAME;
const HOST = process.env.REDIS_SOCKET_HOST;

export const pubClient = createClient({
    username: USERNAME,
    password: PASSWORD,
    socket: {
        host: HOST,
        port: PORT
    }
})

export const subClient = pubClient.duplicate()

pubClient.on('error', (err) => console.log('Redis Client Error', err));
subClient.on('error', (err) => console.log('Redis Subscribe Client Error', err));

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