import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAuthenticatedRequest } from "./interfaces.js";
import { TJWTPayload } from "./types.js";
import { googleAuthClient } from "../app.js";
import { IGoogleLoginRequest } from "../routes/authentication/interfaces.js";

export const authenticateRequestMiddleware = ( req : Request, res : Response, next : NextFunction ) => {

    const accessToken = req.cookies["accessToken"];

    if ( !accessToken ) {
        res.status(401).json({ message : "Unauthorized" });
        return;
    }
    
    try {
        const decodedToken = jwt.verify(accessToken, process.env.JSONWEBTOKEN_SECRET) as TJWTPayload;
        (req as IAuthenticatedRequest).user = decodedToken;
    } catch (error) {
        res.status(401).json({ message : "Unauthorized" });
        return;
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
