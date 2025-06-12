import { Request } from "express";
import { TJWTPayload } from "./types.js";


export interface IAuthenticatedRequest extends Request {
    user : TJWTPayload
}