import { TCreateProjectTagRequestBody, TUpdateProjectTagRequestBody } from "@repo/taskprio-types";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";

export interface IGetProjectTagsRequest extends IAuthenticatedRequest {
    params : {
        project_id : string
    }
}

export interface ICreateProjectTagRequest extends IAuthenticatedRequest {
    params : {
        project_id : string
    },
    body : TCreateProjectTagRequestBody
}

export interface IUpdateProjectTagRequest extends IAuthenticatedRequest {
    params : {
        project_id : string,
        tag_id : string
    },
    body : TUpdateProjectTagRequestBody
}

export interface IDeleteProjectTagRequest extends IAuthenticatedRequest {
    params : {
        project_id : string,
        tag_id : string
    }
}