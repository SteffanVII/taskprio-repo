import { Request, Response, Router } from "express"
import { ICreateWorkspaceRequest, IGetWorkspaceMemberRequest, IGetWorkspaceRequest, IUpdateWorkspaceMemberRoleRequest } from "./interfaces.js"
import { getPoolClient, getPostgrePool } from "../../database/postgresql.js";
import { getUserWorkspace, getUserWorkspaces, getWorkspaceMember } from "../../database/queries/workspace/query.js";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { createWorkspace, updateWorkspaceMemberRole } from "../../database/queries/workspace/mutation.js";
import { verifyWorkspaceMemberMiddleware } from "../../middlewares/authentication.js";

export const registerWorkspaceRoutes = ( router : Router ) => {

    // GET

    // Get workspaces
    router.get( "/s", async ( req : IAuthenticatedRequest, res : Response ) => {
        const { user_id } = req.user;

        try {
            const workspaces = await getUserWorkspaces(user_id);
            res.status(200).json(workspaces);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message : "Internal server error" });
        }
    } )

    // Get workspace
    router.get( "/:workspace_id", async ( req : IGetWorkspaceRequest, res : Response ) => {
        const { workspace_id } = req.params;
        const { user_id } = req.user;

        try {
            const workspaceMember = await getWorkspaceMember(workspace_id, user_id);

            if ( !workspaceMember ) {
                res.status(404).json({ message : "Not a member of this workspace" });
                return 
            }

            const workspace = await getUserWorkspace(workspace_id, user_id);

            if ( !workspace ) {
                res.status(404).json({ message : "Workspace not found" });
                return 
            }

            res.status(200).json(workspace);

        } catch (error) {
            console.log(error);
            res.status(500).json({ message : "Internal server error" });
        }
    })

    // Get workspace member
    router.get(
        "/member/:workspace_id/:member_id",
        verifyWorkspaceMemberMiddleware,
        async ( req : IGetWorkspaceMemberRequest, res : Response ) => {

            const { workspace_id, member_id } = req.params;

            try {
                const workspaceMember = await getWorkspaceMember(workspace_id, member_id);
                if ( !workspaceMember ) {
                    res.status(404).json({ message : "Workspace member not found" });
                } else {
                    res.status(200).json(workspaceMember);
                }
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

    // POST

    // Create workspace
    router.post( "/", async ( req : ICreateWorkspaceRequest, res : Response ) => {
        const { workspace_name } = req.body;
        const { user_id } = req.user;

        if ( !workspace_name ) {
            res.status(400).json({ message : "Workspace name is required" });
            return
        }

        try {
            const workspace = await createWorkspace( { workspace_name }, user_id )
            res.status(201).json(workspace)
        } catch (error) {
            console.log(error);
            res.status(500).json({ message : "Internal server error" });
        }

    })

    // PATCH
    router.patch(
        "/member-role/:workspace_id/:member_id",
        async ( req : IUpdateWorkspaceMemberRoleRequest, res : Response ) => {

            const {
                workspace_id,
                member_id
            } = req.params
            const { role } = req.body

            try {
                await updateWorkspaceMemberRole(
                    workspace_id,
                    member_id,
                    role
                )
                res.status(200).json({ message : "Workspace member role updated" })
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

}
