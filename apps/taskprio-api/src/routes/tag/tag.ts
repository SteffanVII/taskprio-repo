import { Router, Request, Response } from "express";
import { ICreateProjectTagRequest, IDeleteProjectTagRequest, IGetProjectTagsRequest, IUpdateProjectTagRequest } from "./interfaces.js";
import { getProjectTags } from "../../database/queries/tag/query.js";
import { getProjectMember } from "../../database/queries/project/query.js";
import { createProjectTag, deleteProjectTag, updateProjectTag } from "../../database/queries/tag/mutation.js";
import { verifyProjectMemberMiddleware } from "../../middlewares/authentication.js";

export const registerTagRoutes = ( router : Router ) => {

    router.get(
        "/s/:project_id",
        verifyProjectMemberMiddleware,
        async ( req : IGetProjectTagsRequest, res : Response ) => {

            const {
                user_id
            } = req.user

            const {
                project_id
            } = req.params

            const isProjectMember = await getProjectMember( project_id, user_id );

            // 401
            if ( !isProjectMember ) {
                res.status(401).json({
                    message : "You are not a member of this project"
                })
                return
            }

            const tags = await getProjectTags( project_id );

            // 200
            res.status(200).json(tags);

        }
    )

    router.post(
        "/:project_id",
        // 401
        verifyProjectMemberMiddleware,
        async ( req : ICreateProjectTagRequest, res : Response ) => {

            const {
                project_id
            } = req.params

            const {
                name,
                color
            } = req.body

            try {

                const tag = await createProjectTag(
                    project_id,
                    name,
                    color
                )

                // 201
                res.status(201).json(tag);

            } catch (error) {
                // 500
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

    router.patch(
        "/:project_id/:tag_id",
        // 401
        verifyProjectMemberMiddleware,
        async ( req : IUpdateProjectTagRequest, res : Response ) => {

            const {
                project_id,
                tag_id
            } = req.params

            const {
                name,
                color
            } = req.body

            // 400
            if ( !name || !color ) {
                res.status(400).json({
                    message : "You need to provide atleast one of the properties to update"
                })
                return
            }

            try {

                const tag = await updateProjectTag(
                    project_id,
                    tag_id,
                    name,
                    color
                )

                // 200
                res.status(200).json(tag)

            } catch (error) {
                // 500
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

    router.delete(
        "/:project_id/:tag_id",
        // 401
        verifyProjectMemberMiddleware,
        async ( req : IDeleteProjectTagRequest, res : Response ) => {

            const {
                project_id,
                tag_id
            } = req.params

            try {

                const deletedTag = await deleteProjectTag(
                    project_id,
                    tag_id
                )

                if ( !deletedTag ) {
                    // 404
                    res.status(404).json({
                        message : "Tag not found"
                    })
                    return
                }

                // 200
                res.status(200).json(deletedTag)

            } catch (error) {
                // 500
                res.status(500).json({
                    message : "Internal server error"
                })
            }

        }
    )

}