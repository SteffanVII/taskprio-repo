import { TGetProjectTaskboardListRequestQuery, TGetTaskboardTrashTasksRequestParams } from "@repo/taskprio-types";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";

export interface IGetProjectTaskboardListRequest extends IAuthenticatedRequest {
    query : TGetProjectTaskboardListRequestQuery
}

export interface IGetTaskboardTrashTasksRequest extends IAuthenticatedRequest {
    query : TGetTaskboardTrashTasksRequestParams
}