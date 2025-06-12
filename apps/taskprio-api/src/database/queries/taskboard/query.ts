import { PoolClient } from "pg";
import { TTaskboard } from "../../../routes/taskboard/types.js";
import { getPoolClient } from "../../postgresql.js";


export const getProjectTaskboardList = async ( project_id : string, poolClient? : PoolClient ) : Promise<TTaskboard[] | undefined> => {

    const {
        client,
        release
    } = await getPoolClient(poolClient)

    try {
        const taskboardList = await client.query({
            text : `-- sql
                SELECT
                    *
                FROM
                    public."task_board"
                WHERE
                    project_id = $1
            `,
            values : [ project_id ]
        })
        return taskboardList.rows;
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }

}