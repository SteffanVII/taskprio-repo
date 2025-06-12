import { Response, Router } from "express";
import { IGetProjectTaskboardListRequest } from "./interfaces.js";
import { getProjectTaskboardList } from "../../database/queries/taskboard/query.js";
import { getProjectMember } from "../../database/queries/project/query.js";


export const registerTaskboardRoutes = ( router : Router ) => {

    router.get(
        `/s`,
        async ( req : IGetProjectTaskboardListRequest, res : Response ) => {
            const { project_id } = req.query;
            const { user_id } = req.user;

            const projectMember = await getProjectMember(project_id, user_id);

            if ( !projectMember ) {
                res.status(403).json({
                    message : "You are not a member of this project"
                })
            }

            const taskboardList = await getProjectTaskboardList(project_id);

            res.status(200).json(taskboardList);
        }
    )

    router.post(
        `/`,
        async () => {

        }
    )

}