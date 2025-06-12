import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { TGetProjectTaskboardListRequestQuery } from "./types.js";


export interface IGetProjectTaskboardListRequest extends IAuthenticatedRequest {
    query : TGetProjectTaskboardListRequestQuery
}