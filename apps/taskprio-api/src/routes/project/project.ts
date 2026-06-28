import dotenv from "dotenv";
import { IAddProjectMembersRequest, ICreateProjectRequest, IDeactivateProjectRequest, IDeactiveProjectMemberRequest, IDropProjectRequest, IGetDeactivatedProjectsRequest, IGetProjectListWithUserAssignedTasksRequest, IGetProjectMemberRequest, IGetProjectMembersRequest, IGetUserWorkspaceProjectsRequest, IReactivateProjectMemberRequest, IReactivateProjectRequest, IUpdateProjectCustomizationRequest, IUpdateProjectMemberRoleRequest } from "./interfaces.js";
import { Response, Router } from "express";
import { getProject, getProjectListWithUserAssignedTasks, getProjectMember, getProjectMembers, getUserProjects, getUserWorkspaceProjects, getWorkpaceInactiveProjectList } from "../../database/queries/project/query.js";
import { IAuthenticatedRequest } from "../../middlewares/interfaces.js";
import { addMembersToProject, createProject, deactivateProject, deactivateProjectMember, dropProject, reactivateProject, reactivateProjectMember, updateProjectCustomization, updateProjectMemberRole } from "../../database/queries/project/mutation.js";
import { verifyProjectMemberMiddleware, verifyProjectOwnerOrAdminMiddleware, verifyWorkspaceMemberMiddleware, verifyWorkspaceOwnerOrAdminMiddleware } from "../../middlewares/authentication.js";
import { getWorkspaceIdFromProjectId } from "../../database/queries/workspace/query.js";

dotenv.config();

const registerProjectRoutes = (router: Router) => {

  // GET

  // Get project with additional data
  router.get(
    "/:project_id",
    async (req: IAuthenticatedRequest, res: Response) => {
      const { project_id } = req.params;
      try {
        const project = await getProject(project_id);
        res.status(200).json(project);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
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
    async (req: IAuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      try {
        const projects = await getUserProjects(user_id);
        res.status(200).json(projects);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }

    }
  )

  // Get projects with additional data by workspace
  router.get(
    "/s/:workspace_id",
    async (req: IGetUserWorkspaceProjectsRequest, res: Response) => {

      const { workspace_id } = req.params;
      const { user_id } = req.user;

      try {
        const projects = await getUserWorkspaceProjects(workspace_id, user_id);
        res.status(200).json(projects);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  )

  // Get project members
  router.get(
    "/members/:project_id",
    verifyProjectMemberMiddleware,
    async (req: IGetProjectMembersRequest, res: Response) => {

      const { project_id } = req.params;

      try {
        const projectMembers = await getProjectMembers(project_id);
        res.status(200).json(projectMembers);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }

    }
  )

  router.get(
    "/member/:project_id/:member_id",
    verifyProjectMemberMiddleware,
    async (req: IGetProjectMemberRequest, res: Response) => {

      const { project_id, member_id } = req.params;

      try {
        const projectMember = await getProjectMember(project_id, member_id)
        if (!projectMember) {
          res.status(404).json({ message: "Project member not found" });
        } else {
          res.status(200).json(projectMember);
        }
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" });
      }
    }
  )

  router.get(
    `/deactivated/:workspace_id`,
    verifyWorkspaceOwnerOrAdminMiddleware,
    async (req: IGetDeactivatedProjectsRequest, res: Response) => {

      const { workspace_id } = req.params

      try {
        const projectList = await getWorkpaceInactiveProjectList(workspace_id)
        res.status(200).json(projectList)
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )

  // Get project list by workspace with tasks assigned to user
  router.get(
    "/project-list-with-user-assigned-tasks/:workspace_id",
    verifyWorkspaceMemberMiddleware,
    async (req: IGetProjectListWithUserAssignedTasksRequest, res: Response) => {

      const { workspace_id } = req.params;
      const { user_id } = req.user;
      try {
        const data = await getProjectListWithUserAssignedTasks(workspace_id, user_id)
        res.status(200).json(data)
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )

  // POST

  // Create project
  router.post(
    "/",
    async (req: ICreateProjectRequest, res: Response) => {
      const { user_id } = req.user;
      try {
        const createdProject = await createProject(req.body, user_id);
        res.status(201).json(createdProject);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  )

  // Add project members
  router.post(
    "/add-members/:project_id",
    verifyProjectMemberMiddleware,
    verifyProjectOwnerOrAdminMiddleware,
    async (req: IAddProjectMembersRequest, res: Response) => {

      const { project_id } = req.params
      const { members } = req.body
      const { user_id } = req.user

      try {

        const workspaceId = await getWorkspaceIdFromProjectId(project_id)

        if (!workspaceId) {
          res.status(404).json({ message: "Workspace not found" })
          return
        }

        const addedMembers = await addMembersToProject(
          project_id,
          user_id,
          members
        )

        res.status(200).json(addedMembers)
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )

  router.post(
    "/deactivate",
    verifyWorkspaceOwnerOrAdminMiddleware,
    async (req: IDeactivateProjectRequest, res: Response) => {

      const { workspace_id, project_id } = req.body

      try {
        await deactivateProject(workspace_id, project_id)
        res.status(200).json({ message: "Project deactivated" })
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )

  router.post(
    "/reactivate",
    verifyWorkspaceOwnerOrAdminMiddleware,
    async (req: IReactivateProjectRequest, res: Response) => {
      const { workspace_id, project_id } = req.body
      try {
        await reactivateProject(
          workspace_id,
          project_id
        )
        res.status(200).json({ message: "Project reactivated" })
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }
    }
  )

  // PATCH

  // Update project customization
  router.patch(
    "/customization/:project_id",
    verifyProjectMemberMiddleware,
    verifyProjectOwnerOrAdminMiddleware,
    async (req: IUpdateProjectCustomizationRequest, res: Response) => {

      const {
        project_name,
        project_abbreviation,
        project_color
      } = req.body

      if (!project_name && !project_abbreviation && !project_color) {
        res.status(304).json({ message: "No changes to update" });
        return
      }

      try {
        const workspaceId = await getWorkspaceIdFromProjectId(req.params.project_id)

        if (!workspaceId) {
          res.status(404).json({ message: "Project not found" })
          return
        }

        const updatedProject = await updateProjectCustomization(
          req.params.project_id,
          req.body
        )

        res.status(200).json(updatedProject)
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )

  // Update project member role
  router.patch(
    "/member-role/:project_id/:member_id",
    verifyProjectMemberMiddleware,
    verifyProjectOwnerOrAdminMiddleware,
    async (req: IUpdateProjectMemberRoleRequest, res: Response) => {

      const { project_id, member_id } = req.params
      const { role } = req.body

      try {

        const workspaceId = await getWorkspaceIdFromProjectId(project_id)

        if (!workspaceId) {
          res.status(404).json({ message: "Workspace not found" })
          return
        }

        await updateProjectMemberRole(
          project_id,
          member_id,
          role
        )

        res.status(200).json({ message: "Project member role updated" })
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )

  router.patch(
    "/member/deactivate",
    verifyProjectOwnerOrAdminMiddleware,
    async (req: IDeactiveProjectMemberRequest, res: Response) => {

      const { project_id, member_id } = req.body;

      try {

        const workspaceId = await getWorkspaceIdFromProjectId(project_id)

        if (!workspaceId) {
          res.status(404).json({ message: "Workspace not found" })
          return
        }

        await deactivateProjectMember(member_id, project_id)

        res.status(200).json({ message: "Project member deactivated" })

      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )

  router.patch(
    "/member/reactivate",
    async (req: IReactivateProjectMemberRequest, res: Response) => {

      const { project_id, member_id } = req.body;

      try {

        const workspaceId = await getWorkspaceIdFromProjectId(project_id)

        if (!workspaceId) {
          res.status(404).json({ message: "Workspace not found" })
          return
        }

        await reactivateProjectMember(member_id, project_id)

        res.status(200).json({ message: "Project member reactivated" })

      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )

  // DELETE
  router.delete(
    "/drop",
    verifyWorkspaceOwnerOrAdminMiddleware,
    async (req: IDropProjectRequest, res: Response) => {

      const { workspace_id, project_id, project_name } = req.query

      try {
        await dropProject(workspace_id, project_id, project_name)
        res.status(200).json({ message: "Project deleted successfully" })
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
      }

    }
  )
}

export default registerProjectRoutes;