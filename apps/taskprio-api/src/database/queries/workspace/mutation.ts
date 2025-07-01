import { PoolClient } from "pg";
import { getPoolClient, getPostgrePool } from "../../postgresql.js";
import { getUserWorkspace, getWorkspaceMember } from "./query.js";
import slugify from "slugify";
import { Request } from "express";
import { EWorkspaceRole, TCreateWorkspaceBody, TWorkspace, TWorkspaceMember } from "@repo/taskprio-types";

export const createWorkspace = async ( body : TCreateWorkspaceBody, user_id : string, request : Request, postgreClient? : PoolClient ) : Promise<TWorkspace | undefined> => {
    
    const {
        client,
        release
    } = await getPoolClient(postgreClient);

    try {

        await client.query("BEGIN")

        const workspaceSlug = slugify.default(
            `${body.workspace_name}${Date.now()}`,
            {
                lower : true,
                strict : true,
                locale : request.headers['accept-language']?.split(',')[0] || 'en',
                remove : /[*+~.()'"!:@]/g,
            }
        )

        const createdWorkspace = await client.query({
            text : `--sql
                INSERT INTO workspace."workspace" (
                    workspace_name,
                    workspace_slug
                )
                VALUES (
                    $1,
                    $2
                )
                RETURNING *
            `,
            values : [ body.workspace_name, workspaceSlug ]
        })

        if ( !createdWorkspace.rows[0] ) {
            client.query("ROLLBACK")
            throw new Error("Failed to create workspace");
        }

        const createdWorkspaceMember = await client.query({
            text : `--sql
                INSERT INTO workspace."workspace_members" (
                    workspace_id,
                    user_id,
                    workspace_role,
                    invited_by
                )
                VALUES ($1, $2, $3, $4) RETURNING *
            `,
            values : [ createdWorkspace.rows[0].workspace_id, user_id, EWorkspaceRole.OWNER + 1, user_id ]
        })

        if ( !createdWorkspaceMember.rows[0] ) {
            client.query("ROLLBACK")
            throw new Error("Failed to create workspace member");
        }

        await client.query("COMMIT")
        
        const workspace = await getUserWorkspace( createdWorkspace.rows[0].workspace_id, user_id, client )

        return workspace;

    } catch (error) {
        client.query("ROLLBACK")
        console.log(error);
        throw error;
    } finally {
        release()
    }

}

export const addWorkspaceMember = async (
    workspace_id : string,
    user_id : string,
    email : string,
    workspace_role : EWorkspaceRole,
    invited_by : string,
    postgreClient? : PoolClient
) : Promise<TWorkspaceMember | undefined> => {

    const {
        client,
        release,
        internalClient
    } = await getPoolClient(postgreClient)

    try {

        if ( internalClient ) await client.query("BEGIN")

        await client.query({
            text : `--sql
                INSERT INTO workspace."workspace_members" (
                    workspace_id,
                    user_id,
                    workspace_role,
                    invited_by
                ) VALUES ($1, $2, $3, $4)
            `,
            values : [
                workspace_id,
                user_id,
                workspace_role,
                invited_by
            ]
        })

        await client.query({
            text : `--sql
                UPDATE invitation."workspace_invitation" 
                SET accepted = TRUE 
                WHERE workspace_id = $1 
                AND email = $2
            `,
            values : [
                workspace_id,
                email
            ]
        })

        if ( internalClient ) await client.query("COMMIT")

        console.log(workspace_id, user_id);

        const workspaceMember = await getWorkspaceMember( workspace_id, user_id, client )

        return workspaceMember

    } catch (error) {
        if ( internalClient ) await client.query("ROLLBACK")
        console.log(error)
        throw error
    } finally {
        release()
    }

}