import { TCreateProjectTagRequestBody, TUpdateProjectTagRequestBody } from "@repo/taskprio-types"


export type TCreateProjectTagPayload = {
    params: {
        project_id: string
    },
    body: TCreateProjectTagRequestBody
}

export type TUpdateProjectTagPayload = {
    params: {
        project_id: string,
        tag_id: string
    },
    body: TUpdateProjectTagRequestBody
}

export type TDeleteProjectTagPayload = {
    params: {
        project_id: string,
        tag_id: string
    }
}