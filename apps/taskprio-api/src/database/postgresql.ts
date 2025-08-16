import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool : Pool | undefined; 

export const createPostgrePool = () => {
    pool = new Pool({
        connectionString : process.env.SUPABASE_CONNECTION_URI,
        ssl : {
            rejectUnauthorized : false
        }
    })
}

export const getPostgrePool = () => {
    return pool;
}

export const testDatabaseConnection = async () => {
    if ( !pool ) {
        throw new Error("Postgre pool not initialized");
    }

    const client = await getPostgrePool().connect();

    try {
        const result = await client.query("SELECT CURRENT_TIMESTAMP")
        console.log(`Database time - ${result.rows[0].current_timestamp}`)
        console.log(`Database connection successful!`)
    } catch (error) {
        throw error        
    } finally {
        client.release();
    }
}

export const getPoolClient = async ( postgreClient? : PoolClient ) : Promise<{
    internalClient : boolean,
    client : PoolClient,
    release : () => void,
    rollback : () => void,
    begin : () => Promise<void>,
    commit : () => Promise<void>
}> => {
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
    return {
        internalClient,
        client,
        release : () => {
            if ( internalClient ) client.release();
        },
        begin : async () => {
            if ( internalClient ) await client.query("BEGIN")
        },
        commit : async() => {
            if ( internalClient ) await client.query("COMMIT")
        },
        rollback : async () => {
            if ( internalClient ) await client.query("ROLLBACK")
        }
    };
}

/**
 * 
 * @param {Function} originalFunction The function that will be wrapped and returned. Note : If you provide a pool client when calling the wrapped function, you need to handle the transaction yourself. Like calling BEGIN and COMMIT.
 * @param {boolean} [transaction] If you want to wrap the function in a transaction, set this to true.
 * @returns {Function} The wrapped function.
 */
export const databaseFunctionWrapper = <TArgs extends any[], TReturn>(
    originalFunction : ( client : PoolClient, ...args : TArgs ) => Promise<TReturn>,
    transaction? : boolean
) => {

    return async (
        ...args: [...TArgs, poolClient? : PoolClient]
    ) : Promise<TReturn> => {

        const lastArg = args[args.length - 1];
        let poolClient : PoolClient | undefined = undefined;

        if ( (lastArg as PoolClient).query !== undefined ) {
            poolClient = args.pop() as PoolClient;
        }

        const {
            client,
            release,
            rollback,
            begin,
            commit
        } = await getPoolClient(poolClient);

        try {

            if ( transaction ) await begin() 

            const result = await originalFunction( client, ...args as unknown as TArgs )

            if ( transaction ) await commit()

            return result;

        } catch (error) {
            console.log(error);
            rollback();
            throw error;
        } finally {
            release();
        }

    }

}

export class ClausesOrganizer {

    private clauses : string[] = [];
    private values : any[] = []

}

export const clausesOrganizer = () : {
    clauses : string[],
    values : any[],
    push : ( propertyName : string, value : any ) => void,
    joinClauses : () => string,
    joinValues : () => string,
    joinClausesAndValueIndex : ( condition? : string, offset? : number ) => string,
} => {

    const clauses : string[] = [];
    const values : any[] = [];

    const push = ( propertyName : string, value : any ) => {
        clauses.push(`${propertyName}`)
        values.push(value)
    }

    const joinClauses = () => {
        return clauses.join(', ')
    }

    const joinValues = () => {
        return values.join(', ')
    }

    const joinClausesAndValueIndex = ( condition? : string, offset? : number ) => {
        return clauses.map( ( clause, index ) => {
            return `${clause} = $${index + (offset || 0) + 1}`
        } ).join( condition ? ` ${condition} ` : ', ' )
    }

    return {
        clauses,
        values,
        push,
        joinClauses,
        joinValues,
        joinClausesAndValueIndex
    }

}