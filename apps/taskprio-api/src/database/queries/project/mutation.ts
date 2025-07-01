import { Request } from "express";
import { PoolClient } from "pg";
import { getPoolClient } from "../../postgresql.js";
import slugify from "slugify";
import { getProject } from "./query.js";
import { createTaskboard } from "../taskboard/mutation.js";
import { EProjectRole, TCreateProjectRequestBody, TProject } from "@repo/taskprio-types";

export const createProject = async (
    body : TCreateProjectRequestBody,
    user_id : string,
    req : Request,
    poolClient? : PoolClient
) : Promise<TProject | undefined> => {

    const {
       client,
       release
    } = await getPoolClient(poolClient)

    try {

        await client.query("BEGIN")

        const projectSlug = slugify.default(
            `${body.project_name}${Date.now()}`,
            {
                lower : true,
                strict : true,
                locale : req.headers['accept-language']?.split(',')[0] || 'en',
                remove : /[*+~.()'"!:@]/g,
            }
        )

        // Create the project data
        const createdProject = await client.query({
            text : `--sql
                INSERT INTO project."project" (project_name, project_slug) VALUES ($1, $2) RETURNING *;
            `,
            values : [body.project_name, projectSlug]
        })

        if ( !createdProject.rows[0] ) {
            client.query("ROLLBACK")
            throw new Error("Failed to create project");
        }

        // Create the join for workspace and project
        const createdWorkspaceProject = await client.query({
            text : `--sql
                INSERT INTO project."workspace_projects" ( workspace_id, project_id, user_id ) VALUES ($1, $2, $3) RETURNING *;
            `,
            values : [ body.workspace_id, createdProject.rows[0].project_id, user_id ]
        })

        if ( !createdWorkspaceProject.rows[0] ) {
            client.query("ROLLBACK")
            throw new Error("Failed to create project member")
        }
    
        // Create the join for user and project
        const createdProjectMember = await client.query({
            text : `--sql
                INSERT INTO project."project_members" (user_id, project_id, project_role, invited_by) VALUES ($1, $2, $3, $4) RETURNING *;
            `,
            values : [ user_id, createdProject.rows[0].project_id, EProjectRole.OWNER + 1, user_id ]
        })

        if ( !createdProjectMember.rows[0] ) {
            client.query("ROLLBACK")
            throw new Error("Failed to create project member");
        }

        await createTaskboard(
            createdProject.rows[0].project_id,
            body.project_name + " Board",
            user_id,
            req,
            client
        )

        await client.query("COMMIT");
        
        const project = await getProject(createdProject.rows[0].project_id, client);
        
        return project;
        
    } catch (error) {
        console.log(error);
        await client.query("ROLLBACK")
        throw error;
    } finally {
        release()
    }

}