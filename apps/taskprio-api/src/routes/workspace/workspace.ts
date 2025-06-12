import { Request, Response, Router } from "express"
import { ICreateWorkspaceRequest, IGetWorkspaceRequest } from "./interfaces.js"
import { getPoolClient, getPostgrePool } from "../../database/postgresql.js";
import { getUserWorkspace, getUserWorkspaces, getWorkspaceMember } from "../../database/queries/workspace/query.js";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { createWorkspace } from "../../database/queries/workspace/mutation.js";

export const registerWorkspaceRoutes = ( router : Router ) => {

    // Get workspace
    router.get( "/", async ( req : IGetWorkspaceRequest, res : Response ) => {
        const { workspace_id } = req.params;
        const { user_id } = req.user;

        try {
            const client = await getPostgrePool().connect();

            const workspaceMember = await getWorkspaceMember(workspace_id, user_id, client);

            if ( !workspaceMember ) {
                res.status(404).json({ message : "Not a member of this workspace" });
                return 
            }

            const workspace = await getUserWorkspace(workspace_id, user_id, client);

            if ( !workspace ) {
                res.status(404).json({ message : "Workspace not found" });
                return 
            }

            client.release()

            res.status(200).json(workspace);

        } catch (error) {
            console.log(error);
            res.status(500).json({ message : "Internal server error" });
        }
    })

    // Get workspaces
    router.get( "/s", async ( req : IAuthenticatedRequest, res : Response ) => {
        const { user_id } = req.user;

        try {
            const client = await getPostgrePool().connect();
            const workspaces = await getUserWorkspaces(user_id, client);
            client.release()
            res.status(200).json(workspaces);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message : "Internal server error" });
        }
    } )

    // Create workspace
    router.post( "/", async ( req : ICreateWorkspaceRequest, res : Response ) => {
        const { workspace_name } = req.body;
        const { user_id } = req.user;
        console.log(req.user);
        if ( !workspace_name ) {
            res.status(400).json({ message : "Workspace name is required" });
            return
        }

        try {
            const workspace = await createWorkspace( { workspace_name }, user_id, req )
            res.status(201).json(workspace)
        } catch (error) {
            console.log(error);
            res.status(500).json({ message : "Internal server error" });
        }

    })

    // Invite user to workspace
    router.post(
        `/invite`,
        async () => {
            
        }
    )

}
