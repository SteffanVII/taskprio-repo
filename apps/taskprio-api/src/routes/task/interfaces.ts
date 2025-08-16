import { TArrangeTaskRequestBody, TUpdateTaskPrimitiveFieldsRequestBody } from "@repo/taskprio-types"
import { IAuthenticatedProjectMemberRequest, IAuthenticatedRequest } from "../../middlewares/interfaces.js"

export interface ICreateTaskRequest extends IAuthenticatedProjectMemberRequest {
    body : {
        task_section_id : string,
        task_title : string
    }
}

export interface IArrangeTaskRequest extends IAuthenticatedRequest {
    params : { task_id : string },
    body : TArrangeTaskRequestBody
}

export interface ITransferTaskToTrashRequest extends IAuthenticatedRequest {
    params : { task_id : string }
}

export interface IUpdateTaskPrimitiveFieldsRequest extends IAuthenticatedProjectMemberRequest {
    params : { task_id : string },
    body : TUpdateTaskPrimitiveFieldsRequestBody
}

export interface IAddTaskAssigneeRequest extends IAuthenticatedRequest {
    params : { task_id : string },
    body : {
        user_id : string
    }
}

export interface IRemoveTaskAssigneeRequest extends IAuthenticatedRequest {
    params : { task_id : string },
    body : {
        user_id : string
    }
}

export interface ILogTaskTimeRequest extends IAuthenticatedRequest {
    params : { task_id : string },
    body : {
        time_spent : number
    }
}