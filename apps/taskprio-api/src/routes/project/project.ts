import dotenv from "dotenv";
import { IAddProjectMembersRequest, ICreateProjectRequest, IGetProjectMemberRequest, IGetProjectMembersRequest, IGetUserWorkspaceProjectsRequest, IUpdateProjectCustomizationRequest, IUpdateProjectMemberRoleRequest } from "./interfaces.js";
import { Response, Router } from "express";
import { getProject, getProjectMember, getProjectMembers, getUserProjects, getUserWorkspaceProjects } from "../../database/queries/project/query.js";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { addMembersToProject, addMemberToProjects, createProject, updateProjectCustomization, updateProjectMemberRole } from "../../database/queries/project/mutation.js";
import { verifyProjectMemberMiddleware, verifyProjectOwnerOrAdminMiddleware } from "../../middlewares/authentication.js";

dotenv.config();

const registerProjectRoutes = ( router : Router ) => {

    // GET

    // Get project with additional data
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

    // Get project with primitive data
    router.get(
        "/primitive/:project_id",
        async () => {
            
        }
    )

    // Get projects with additional data
    router.get(
        "/s",
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

    // Get projects with additional data by workspace
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

    // Get project members
    router.get(
        "/members/:project_id",
        verifyProjectMemberMiddleware,
        async ( req : IGetProjectMembersRequest, res : Response ) => {

            const { project_id } = req.params;

            try {
                const projectMembers = await getProjectMembers(project_id);
                res.status(200).json(projectMembers);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }

        }
    )

    router.get(
        "/member/:project_id/:member_id",
        verifyProjectMemberMiddleware,
        async ( req : IGetProjectMemberRequest, res : Response ) => {

            const { project_id, member_id } = req.params;

            try {
                const projectMember = await getProjectMember( project_id, member_id )
                if ( !projectMember ) {
                    res.status(404).json({ message : "Project member not found" });
                } else {
                    res.status(200).json(projectMember);
                }
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" });
            }
        }
    )

    // POST

    // Create project
    router.post(
        "/",
        async ( req : ICreateProjectRequest, res : Response ) => {
            const { user_id } = req.user;
            try {
                const createdProject = await createProject(req.body, user_id);
                res.status(201).json(createdProject);
            } catch (error) {
                console.log(error);
                res.status(500).json({ message : "Internal server error" });
            }
        }
    )

    // Add project members
    router.post(
        "/add-members/:project_id",
        verifyProjectMemberMiddleware,
        verifyProjectOwnerOrAdminMiddleware,
        async ( req : IAddProjectMembersRequest, res : Response ) => {

            const { project_id } = req.params
            const { members } = req.body
            const { user_id } = req.user

            try {
                const addedMembers = await addMembersToProject(
                    project_id,
                    user_id,
                    members
                )
                res.status(200).json(addedMembers)
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // PATCH

    // Update project customization
    router.patch(
        "/customization/:project_id",
        verifyProjectMemberMiddleware,
        verifyProjectOwnerOrAdminMiddleware,
        async ( req : IUpdateProjectCustomizationRequest, res : Response ) => {

            const {
                project_name,
                project_abbreviation,
                project_color
            } = req.body

            if ( !project_name && !project_abbreviation && !project_color ) {
                res.status(304).json({ message : "No changes to update" });
                return
            }

            try {
                const updatedProject = await updateProjectCustomization(
                    req.params.project_id,
                    req.body
                )
                res.status(200).json(updatedProject)
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )

    // Update project member role
    router.patch(
        "/member-role/:project_id/:member_id",
        verifyProjectMemberMiddleware,
        verifyProjectOwnerOrAdminMiddleware,
        async ( req : IUpdateProjectMemberRoleRequest, res : Response ) => {

            const { project_id, member_id } = req.params
            const { role } = req.body

            try {
                await updateProjectMemberRole(
                    project_id,
                    member_id,
                    role
                )
                res.status(200).json({ message : "Project member role updated" })
            } catch (error) {
                console.log(error)
                res.status(500).json({ message : "Internal server error" })
            }

        }
    )
}

export default registerProjectRoutes;