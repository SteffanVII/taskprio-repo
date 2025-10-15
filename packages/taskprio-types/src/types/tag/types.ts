import { Selectable } from "kysely";
import { ProjectProjectTags } from "../../db";
import { TTask } from "../task/types";


export type TCreateProjectTagRequestBody = {
    name : string,
    color : string
}

export type TCreateProjectTagResponse = TTag;

export type TUpdateProjectTagRequestBody = {
    name : string,
    color : string
}

export type TUpdateProjectTagResponse = TTag;

export type TGetProjectTagsResponse = TTag[]

export type TDeleteProjectTagResponse = TTag;

// Tag

export type TTag = Selectable<ProjectProjectTags>

export type TTaskTag = Omit<TTag, "project_id"> & Pick<TTask, "task_id">