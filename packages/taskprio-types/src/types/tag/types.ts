
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

export type TTag = {
    tag_id : string,
    tag_name : string,
    tag_color : string,
    project_id : string,
}