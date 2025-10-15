
import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'FoLKplqmQ6H84gPt6vF0xZTbYxv90NmT',
    socket: {
        host: 'redis-12407.crce194.ap-seast-1-1.ec2.redns.redis-cloud.com',
        port: 12407
    }
});

client.on('error', err => console.log('Redis Client Error', err));

export const redisConnect = async () => {
    await client.connect();
}