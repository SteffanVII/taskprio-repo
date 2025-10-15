import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAuthenticatedProjectMemberRequest, IAuthenticatedRequest, IAuthenticatedWorkspaceMemberRequest } from "./interfaces.js";
import { TJWTPayload } from "./types.js";
import { googleAuthClient } from "../app.js";
import { IGoogleLoginRequest } from "../routes/authentication/interfaces.js";
import { configDotenv } from "dotenv";
import { getProjectMember, getProjectMemberByTaskboardId, getProjectMemberByTaskId, getProjectMemberByTaskSectionId } from "../database/queries/project/query.js";
import { EProjectRole, EWorkspaceRole, TProjectMember } from "@repo/taskprio-types";
import { TWorkspaceMember } from "@repo/taskprio-types";
import { getWorkspaceMember, getWorkspaceMemberByTaskSectionId, getWorkspaceMemberByTaskId, getWorkspaceMemberByProjectId, getWorkspaceMemberByTaskboardId } from "../database/queries/workspace/query.js";

configDotenv();

export const authenticateRequestMiddleware = ( req : Request, res : Response, next : NextFunction ) => {
    
    const invitationAccessToken = req.cookies[process.env.INVITATION_ACCESS_TOKEN_COOKIE_NAME]
    const authAccessToken = req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME];

    const accessToken = invitationAccessToken || authAccessToken;

    if ( !accessToken ) {
        res.status(401).json({ message : "Unauthorized" });
        return;
    }
    
    try {
        const decodedToken = jwt.verify(accessToken, process.env.JSONWEBTOKEN_SECRET) as TJWTPayload;
        (req as IAuthenticatedRequest).user = decodedToken;
    } catch (error) {
        res.status(401).json({ message : "Unauthorized" });
        throw error;
    }

    next();

}

export const verifyGoogleCredentialdMiddleware = async ( req : IGoogleLoginRequest, res : Response, next : NextFunction ) => {

    const { credential, client_id } = req.body;

    if ( !credential || !client_id ) {
        res.status(400).json({ message : "Credential and client_id are required" });
        return;
    }

    try {

        const ticket = await googleAuthClient.verifyIdToken({
            idToken : credential,
            audience : client_id
        })

        const payload = ticket.getPayload();

        if ( !payload ) {
            res.status(401).json({ message : "Unauthorized" });
            return;
        }

        req.user = {
            google_user_id : payload.sub,
            email : payload.email,
            email_verified : payload.email_verified,
            name : payload.name,
            given_name : payload.given_name,
            family_name : payload.family_name,
            picture : payload.picture
        }
        
        next();
    } catch (error) {
        res.status(401).json({ message : "Unauthorized" });
        return;
    }
}

/**
 * @description This middleware is used to verify if the user is a member of the project. For this middleware to work, the request must have a projectId or taskId in the param or the body. 
 */
export const verifyProjectMemberMiddleware = async (
    req : IAuthenticatedProjectMemberRequest,
    res : Response,
    next : NextFunction
) => {

    const {
        user_id
    } = req.user

    const {
        task_id : taskIdFromParams,
        task_section_id : taskSectionIdFromParams,
        taskboard_id : taskboardIdFromParams,
        project_id : projectIdFromParams,
    } = req.params || {}

   const {
        project_id : projectIdFromBody,
        task_id : taskIdFromBody,
        task_section_id : taskSectionIdFromBody,
        taskboard_id : taskboardIdFromBody
    } = req.body || {}

    let projectId = projectIdFromParams || projectIdFromBody;
    let taskId = taskIdFromParams || taskIdFromBody;
    let taskboardId = taskboardIdFromParams || taskboardIdFromBody;
    const taskSectionId = taskSectionIdFromParams || taskSectionIdFromBody;

    if ( !projectId && !taskId && !taskSectionId && !taskboardId ) {
        res.status(400).json({ message : "Project ID or task ID is required to verify project member" });
        return;
    }

    try {

        let isProjectMember : TProjectMember | undefined;

        if ( projectId ) {
            isProjectMember = await getProjectMember( projectId, user_id )
        } else {
            if ( taskId ) {
                isProjectMember = await getProjectMemberByTaskId( taskId, user_id );
            } else {
                if ( taskboardId ) {
                    isProjectMember = await getProjectMemberByTaskboardId( taskboardId, user_id );
                } else {
                    isProjectMember = await getProjectMemberByTaskSectionId( taskSectionId, user_id )
                }
            }
        }

        if ( !isProjectMember ) {
            res.status(401).json({ message : "You are not a member of this project" });
            return;
        }

        req.projectId = isProjectMember.project_id;

        next();
    } catch (error) {
        res.status(500).json({ message : "Internal server error" });
        return;
    }

}

export const verifyWorkspaceMemberMiddleware = async (
    req : IAuthenticatedWorkspaceMemberRequest,
    res : Response,
    next : NextFunction
) => {

    const {
        user_id
    } = req.user

    const {
        task_id : taskIdFromParams,
        task_section_id : taskSectionIdFromParams,
        taskboard_id : taskboardIdFromParams,
        project_id : projectIdFromParams,
        workspace_id : workspaceIdFromParams
    } = req.params || {}

   const {
        project_id : projectIdFromBody,
        task_id : taskIdFromBody,
        task_section_id : taskSectionIdFromBody,
        taskboard_id : taskboardIdFromBody,
        workspace_id : workspaceIdFromBody
    } = req.body || {}

    let workspaceId = workspaceIdFromParams || workspaceIdFromBody;
    let projectId = projectIdFromParams || projectIdFromBody;
    let taskId = taskIdFromParams || taskIdFromBody;
    let taskboardId = taskboardIdFromParams || taskboardIdFromBody;
    const taskSectionId = taskSectionIdFromParams || taskSectionIdFromBody;

    if ( !workspaceId && !projectId && !taskId && !taskSectionId && !taskboardId ) {
        res.status(400).json({ message : "Worksapce ID or Project ID or task ID or Tasksection ID is required to verify workspace member" });
        return;
    }

    try {
        let isWorkspaceMember : TWorkspaceMember | undefined;

        if ( workspaceId ) {
            isWorkspaceMember = await getWorkspaceMember( workspaceId, user_id );
        } else {
            if ( projectId ) {
                isWorkspaceMember = await getWorkspaceMemberByProjectId( projectId, user_id );
            } else {
                if ( taskId ) {
                    isWorkspaceMember = await getWorkspaceMemberByTaskId( taskId, user_id );
                } else {
                    if ( taskboardId ) {
                        isWorkspaceMember = await getWorkspaceMemberByTaskboardId( taskboardId, user_id );
                    } else {
                        isWorkspaceMember = await getWorkspaceMemberByTaskSectionId( taskSectionId, user_id );
                    }
                }
            }
        }

        if ( !isWorkspaceMember ) {
            res.status(401).json({ message : "You are not a member of this workspace" });
            return;
        }

        req.workspaceId = isWorkspaceMember.workspace_id;
        req.workspaceRole = isWorkspaceMember.workspace_role;

        next();

    } catch (error) {
        console.log(error)
        res.status(500).json({ message : "Internal server error" });
    }

}

export const verifyWorkspaceOwnerOrAdminMiddleware = async (
    req : IAuthenticatedWorkspaceMemberRequest,
    res : Response,
    next : NextFunction
) => {
    verifyWorkspaceMemberMiddleware( req, res, () => {
        const workspaceRole = req.workspaceRole
        if ( workspaceRole !== EWorkspaceRole.OWNER && workspaceRole !== EWorkspaceRole.ADMIN ) {
            res.status(401).json({ message : "You are not the owner or admin of the workspace to be able to dp this action" });
        } else {
            next()
        }
    } )
}

export const verifyProjectOwnerOrAdminMiddleware = async (
    req : IAuthenticatedProjectMemberRequest,
    res : Response,
    next : NextFunction
) => {

    const projectId = req.projectId;

    try {
        const project = await getProjectMember(
            projectId,
            req.user.user_id
        )

        const workspace = await getWorkspaceMemberByProjectId(
            projectId,
            req.user.user_id
        )

        if ( workspace ) {
            if ( workspace.workspace_role !== EWorkspaceRole.OWNER ) {                
                if ( project ) {
                    if ( project.project_role !== EProjectRole.OWNER && project.project_role !== EProjectRole.ADMIN ) {
                        res.status(401).json({ message : "You are not the owner of the project or the workspace to be able to update the project" });
                    } else {
                        next() 
                    }
                }
            } else {
                next()
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message : "Internal server error" });
    }

}