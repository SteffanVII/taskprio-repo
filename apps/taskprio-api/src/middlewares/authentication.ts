import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAuthenticatedProjectMemberRequest, IAuthenticatedRequest } from "./interfaces.js";
import { TJWTPayload } from "./types.js";
import { googleAuthClient } from "../app.js";
import { IGoogleLoginRequest } from "../routes/authentication/interfaces.js";
import { configDotenv } from "dotenv";
import { getProjectMember, getProjectMemberByTaskId, getProjectMemberByTaskSectionId } from "../database/queries/project/query.js";
import { TProjectMember } from "@repo/taskprio-types";

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
        project_id : projectIdFromParams,
        task_id : taskIdFromParams,
        task_section_id : taskSectionIdFromParams
    } = req.params || {}

   const {
        project_id : projectIdFromBody,
        task_id : taskIdFromBody,
        task_section_id : taskSectionIdFromBody
    } = req.body || {}

    let projectId = projectIdFromParams || projectIdFromBody;
    let taskId = taskIdFromParams || taskIdFromBody;
    const taskSectionId = taskSectionIdFromParams || taskSectionIdFromBody;

    if ( !projectId && !taskId ) {
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
                isProjectMember = await getProjectMemberByTaskSectionId( taskSectionId, user_id )
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