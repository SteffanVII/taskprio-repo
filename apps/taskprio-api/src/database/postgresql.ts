import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool : Pool | undefined; 

export const createPostgrePool = () => {
    pool = new Pool({
        host : process.env.POSTGRE_HOST,
        port : parseInt(process.env.POSTGRE_PORT || "5432"),
        user : process.env.POSTGRE_USER,
        password : process.env.POSTGRE_PASSWORD,
        database : process.env.POSTGRE_DATABASE,
    })
}

export const getPostgrePool = () => {
    return pool;
}

export const getPoolClient = async ( postgreClient? : PoolClient ) : Promise<{ internalClient : boolean, client : PoolClient, release : () => void }> => {
    let internalClient : boolean = false;
    let client : PoolClient = postgreClient;
    if ( !postgreClient ) {
        try {
            client = await getPostgrePool().connect();
            internalClient = true;
        } catch (error) {
            throw error;
        }
    }
    return { internalClient, client, release : () => {
        if ( internalClient ) client.release();
    } };
}