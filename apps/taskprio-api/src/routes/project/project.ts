import dotenv from "dotenv";
import { ICreateProjectRequest, IGetUserWorkspaceProjectsRequest } from "./interfaces.js";
import { Response, Router } from "express";
import { getPostgrePool } from "../../database/postgresql.js";
import { EProjectRole } from "../../utilities/enums.js";
import { getProject, getUserProjects, getUserWorkspaceProjects } from "../../database/queries/project/query.js";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { createProject } from "../../database/queries/project/mutation.js";

dotenv.config();

const registerProjectRoutes = ( router : Router ) => {

    router.get(
        "/",
        async ( req : IAuthenticatedRequest, res : Response ) => {
            const { user_id } = req.user;
            try {
                const projects = await getUserProjects(user_id);
                res.status(200).json(projects);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

    // Get projects by workspace
    router.get(
        "/s/:workspace_id",
        async ( req : IGetUserWorkspaceProjectsRequest, res : Response ) => {

            const { workspace_id } = req.params;
            const { user_id } = req.user;

            try {
                const projects = await getUserWorkspaceProjects(workspace_id, user_id);
                res.status(200).json(projects);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }
        }
    )

    router.get(
        "/:project_id",
        async ( req : IAuthenticatedRequest, res : Response ) => {
            const { project_id } = req.params;
            try {
                const project = await getProject(project_id);
                res.status(200).json(project);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }
        }
    )

    router.post(
        "/",
        async ( req : ICreateProjectRequest, res : Response ) => {
            const { user_id } = req.user;
            try {
                const createdProject = await createProject(req.body, user_id, req);

                res.status(201).json(createdProject);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }
        }
    )
}

export default registerProjectRoutes;