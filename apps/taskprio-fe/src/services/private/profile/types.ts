import { TGetProfileResponseData, TUpdateProfilePhotoResponseData, TUpdateProjectMemberRoleRequestBody, TUpdateProjectMemberRoleRequestParams } from "@repo/taskprio-types/src";
import { Area } from "react-easy-crop";

// Mutation
export type TUpdateUserProfilePhotoPayload = {
    crop_area : Area,
    file : File
}

export type TUpdateUserProfilePhotoResponse = TUpdateProfilePhotoResponseData

export type TUpdateProjectMemberRolePayload = {
    params : TUpdateProjectMemberRoleRequestParams,
    body : TUpdateProjectMemberRoleRequestBody
}

// Query
export type TGetUserProfileResponse = TGetProfileResponseData;