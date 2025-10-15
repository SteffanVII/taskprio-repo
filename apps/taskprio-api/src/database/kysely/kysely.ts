import { Kysely, PostgresDialectConfig } from "kysely";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { ITaskprioDatabase } from "./structure.js";
import { DB } from "@repo/taskprio-types";

let dialect : PostgresDialect
export let taskprioKysely : Kysely<DB>

export const createTaskprioKyselyConnection = async () => {

    dialect = new PostgresDialect({
        pool : new Pool({
            connectionString : process.env.SUPABASE_CONNECTION_URI,
            ssl : {
                rejectUnauthorized : false
            }
        })
    })

    taskprioKysely = new Kysely<DB>({
        dialect
    })

}