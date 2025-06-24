import { Response, Router } from "express";
import { ICreateTaskboardSectionRequest, IGetTaskboardSectionsRequest, IUpdateTaskboardSectionRequest } from "./interfaces.js";
import { getLastTaskboardSectionDisplayOrder, getTaskboardSections, getTaskboardSectionsWithTasksForCardView } from "../../database/queries/tasksection/query.js";
import { getProjectMember, getProjectMemberByTaskboardId, getProjectMemberByTaskSectionId } from "../../database/queries/project/query.js";
import { createTaskSection, updateTaskSection } from "../../database/queries/tasksection/mutation.js";

export const registerTaskSectionRoutes = ( router : Router ) => {

    // Get all taskboard sections
    router.get(
        `/s/:task_board_id`,
        async ( req : IGetTaskboardSectionsRequest, res : Response ) => {
            const { task_board_id } = req.params;
            const { user_id } = req.user;
            const { include_tasks } = req.query;

            try {
                const projectMember = await getProjectMemberByTaskboardId(task_board_id, user_id);

                if (!projectMember) {
                    res.status(403).json({ message : "Forbidden" });
                    return
                }

                const taskboardSections = Boolean(include_tasks) ? await getTaskboardSectionsWithTasksForCardView(task_board_id) : await getTaskboardSections(task_board_id);
                res.status(200).json(taskboardSections);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }
        }
    )

    // Create taskboard section
    router.post(
        `/`,
        async ( req : ICreateTaskboardSectionRequest, res : Response ) => {

            const body = req.body;
            const { user_id } = req.user;

            try {

                const projectMember = await getProjectMemberByTaskboardId(body.task_board_id, user_id);

                if (!projectMember) {
                    res.status(403).json({ message : "Forbidden" });
                    return
                }

                const lastTaskboardSectionDisplayOrder = await getLastTaskboardSectionDisplayOrder(body.task_board_id);

                const createdTaskSection = await createTaskSection(
                    body.task_board_id,
                    body.task_section_name,
                    lastTaskboardSectionDisplayOrder + 100
                )

                res.status(201).json(createdTaskSection);

            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

    // Update taskboard section
    router.patch(
        `/:task_section_id`,
        async ( req : IUpdateTaskboardSectionRequest, res : Response ) => {

            const { task_section_id } = req.params;
            const body = req.body;
            const { user_id } = req.user;

            if ( !task_section_id ) {
                res.status(400).json({ message : "Task section ID is required" });
                return
            }

            try {

                const projectMember = await getProjectMemberByTaskSectionId(task_section_id, user_id);

                if (!projectMember) {
                    res.status(403).json({ message : "Forbidden" });
                    return
                }

                const updatedTaskSection = await updateTaskSection( task_section_id, body )

                res.status(200).json(updatedTaskSection);

            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

}