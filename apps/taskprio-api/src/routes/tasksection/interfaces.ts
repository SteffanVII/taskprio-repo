import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { TCreateTaskboardSectionRequestBody, TGetTaskboardSectionsRequestParams, TUpdateTaskboardSectionRequestBody, TUpdateTaskboardSectionRequestParams } from "./types.js";

// Query

export interface IGetTaskboardSectionsRequest extends IAuthenticatedRequest {
    params : TGetTaskboardSectionsRequestParams,
    query : {
        include_tasks : string
    }
}

// Mutation

export interface ICreateTaskboardSectionRequest extends IAuthenticatedRequest {
    body : TCreateTaskboardSectionRequestBody
}

export interface IUpdateTaskboardSectionRequest extends IAuthenticatedRequest {
    params : TUpdateTaskboardSectionRequestParams,
    body : TUpdateTaskboardSectionRequestBody
}