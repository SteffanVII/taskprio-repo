import { TGetProjectTaskboardListRequestQuery } from "@repo/taskprio-types";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";

export interface IGetProjectTaskboardListRequest extends IAuthenticatedRequest {
    query : TGetProjectTaskboardListRequestQuery
}