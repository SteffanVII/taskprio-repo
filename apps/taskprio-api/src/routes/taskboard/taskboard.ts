import { Response, Router } from "express";
import { IGetProjectTaskboardListRequest, IGetTaskboardTrashTasksRequest } from "./interfaces.js";
import { getProjectTaskboardList } from "../../database/queries/taskboard/query.js";
import { getProjectMember } from "../../database/queries/project/query.js";
import { verifyProjectMemberMiddleware } from "../../middlewares/authentication.js";
import { getTaskboardTrashTasks } from "../../database/queries/task/query.js";


export const registerTaskboardRoutes = ( router : Router ) => {

    // GET

    // Get taskboards
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

    // Get taskboard trash tasks
    router.get(
        `/trash-tasks/:taskboard_id`,
        verifyProjectMemberMiddleware,
        async ( req : IGetTaskboardTrashTasksRequest, res : Response ) => {

            const { taskboard_id } = req.params

            try {
                const trash = await getTaskboardTrashTasks(taskboard_id)
                res.status(200).json(trash)
            } catch (error) {
                console.log(error)
                res.status(500).json({message : "Internal server error"})
            }

        }
    )

}