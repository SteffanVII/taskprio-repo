import { PoolClient } from "pg";
import { getPoolClient } from "../../postgresql.js";
import { TWorkspace, TWorkspaceMember } from "@repo/taskprio-types";

export const getUserWorkspace = async ( workspace_id : string, user_id : string, postgreClient? : PoolClient ) : Promise<TWorkspace | undefined> => {
    
    const {
        client,
        release
    } = await getPoolClient(postgreClient);

    try {

        const workspace = await client.query({
            text : `--sql
                SELECT
                    w.workspace_id,
                    w.workspace_slug,
                    w.workspace_name,
                    json_agg(
                        json_build_object(
                            'user_id', all_members_wm.user_id,
                            'email', all_members_u.email,
                            'firstname', all_members_u.firstname,
                            'lastname', all_members_u.lastname,
                            'workspace_role', all_members_wm.workspace_role,
                            'joined_at', all_members_wm.joined_at,
                            'invited_by', all_members_wm.invited_by
                        )
                    ) as workspace_members
                FROM
                    workspace."workspace" w
                JOIN
                    workspace."workspace_members" querying_user_wm ON w.workspace_id = querying_user_wm.workspace_id
                JOIN
                    worksapce."workspace_members" all_members_wm ON w.workspace_id = all_members_wm.workspace_id
                JOIN
                    tp_user."user" all_members_u ON all_memberS_wm.user_id = all_members_u.user_id
                WHERE
                    w.workspace_id = $1 AND querying_user_wm.user_id = $2
                GROUP BY
                    w.workspace_id, w.workspace_name;
            `,
            values : [ workspace_id, user_id ]
        })
        return workspace.rows[0];
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        release()
    }

}

export const getUserWorkspaces = async ( user_id : string, postgreClient? : PoolClient ) : Promise<TWorkspace[]> => {

    try {

        const {
            client,
            release
        } = await getPoolClient(postgreClient);

        const workspaces = await client.query({
            text : `--sql
                SELECT
                    w.workspace_id,
                    w.workspace_slug,
                    w.workspace_name,
                    json_agg(
                        json_build_object(
                            'user_id', all_members_wm.user_id,
                            'email', all_members_u.email,
                            'firstname', all_members_u.firstname,
                            'lastname', all_members_u.lastname,
                            'workspace_role', all_members_wm.workspace_role,
                            'joined_at', all_members_wm.joined_at,
                            'invited_by', all_members_wm.invited_by
                        )
                    ) as workspace_members
                FROM
                    workspace."workspace" w
                JOIN
                    workspace."workspace_members" querying_user_wm ON w.workspace_id = querying_user_wm.workspace_id
                JOIN
                    workspace."workspace_members" all_members_wm ON w.workspace_id = all_members_wm.workspace_id
                JOIN
                    tp_user."user" all_members_u ON all_memberS_wm.user_id = all_members_u.user_id
                WHERE
                    querying_user_wm.user_id = $1
                GROUP BY
                    w.workspace_id, w.workspace_name;
            `,
            values : [ user_id ]
        })

        release()

        return workspaces.rows;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getWorkspaceMember = async ( workspace_id : string, user_id : string, postgreClient? : PoolClient ) : Promise<TWorkspaceMember | undefined> => {

    try {
        
        const {
            client,
            release
        } = await getPoolClient(postgreClient);

        const workspaceMember = await client.query({
            text : `--sql
                SELECT
                    wm.user_id,
                    wm.workspace_role,
                    wm.joined_at,
                    wm.invited_by
                    u.email,
                    u.firstname,
                    u.lastname,
                FROM
                    workspace."workspace_member" wm,
                JOIN
                    tp_user."user" u ON wm.user_id = u.user_id
                WHERE
                    wm.workspace_id = $1 AND wm.user_id = $2
            `,
            values : [workspace_id, user_id]
        })

        release()

        return workspaceMember.rows[0];

    } catch (error) {
        console.log(error);
        throw error;
    }

}