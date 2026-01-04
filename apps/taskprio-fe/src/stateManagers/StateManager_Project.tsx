import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider";
import { useGetUserProjectsByWorkspace } from "@/services/private/project/query";
import { updateGlobalsStore, useGlobalsStore_selectedProject, useGlobalsStore_selectedWorkspace, useGlobalsStore_user } from "@/stores/globals";
import React, { useContext, useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

type TStateManager_Project = {
    children: React.ReactNode
}

const StateManager_Project: React.FC<TStateManager_Project> = ({ children }) => {

    const navigate = useNavigate()

    const { workspace_id, project_id } = useParams()
    const { pathname } = useLocation()
    const {
        channelActions
    } = useContext(WebSocketContext)

    const user = useGlobalsStore_user()
    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const selectedProject = useGlobalsStore_selectedProject()

    const {
        data: projects,
        isFetching: projectsIsFetching,
        isLoading: projectsIsLoading,
        isError: projectsIsError
    } = useGetUserProjectsByWorkspace(selectedWorkspace?.workspace_id)

    useEffect(() => {
        updateGlobalsStore({
            projects,
            projectsIsFetching,
            projectsIsLoading,
            projectsIsError,
            noProjects: (projects && projects.length < 1) ?? false
        })
    }, [
        projects,
        projectsIsFetching,
        projectsIsLoading,
        projectsIsError
    ])

    // If no project_id is selected, navigate to the first project once the projects data are available
    useLayoutEffect(() => {
        // If the user is on the task todo page, don't navigate to the first project
        if (
            pathname.includes("/tt") ||
            pathname.includes("/workspace_settings") ||
            pathname.includes("/task_todo_overlay") ||
            pathname.includes("/statistics")
        ) return

        if (!project_id) {
            if (projects) {
                if (projects.length > 0) {
                    // Check if the selected workspace is the same as the workspace_id
                    // If it's not means the user might have switched workspace and the workspace data hasn't fetched yet
                    // This is to prevent fetching the project data that doesn't belong to the selected workspace
                    if (selectedWorkspace?.workspace_id === workspace_id) {
                        const lastVisitedProject = localStorage.getItem(import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME)
                        if (lastVisitedProject) {
                            const foundProject = projects.find(project => project.project_id === lastVisitedProject)
                            if (foundProject) {
                                localStorage.setItem(import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME, foundProject.project_id)
                                navigate(`/p/w/${workspace_id}/d/${foundProject.project_id}/t`)
                                return
                            }
                        }
                        localStorage.setItem(import.meta.env.VITE_LAST_PROJECT_VISITED_COOKIE_NAME, projects[0].project_id)
                        navigate(`/p/w/${workspace_id}/d/${projects[0].project_id}/t`)
                    }
                }
            }
        }
    }, [
        projects,
        selectedWorkspace,
        project_id,
        workspace_id
    ])

    useLayoutEffect(() => {
        if (!selectedProject && project_id) {
            const foundProject = projects?.find(project => project.project_id === project_id) ?? null;
            const projectMemberRole = foundProject?.project_members.find(projectMember => projectMember.user_id === user?.user_id)?.project_role ?? null
            updateGlobalsStore({
                selectedProject: foundProject,
                projectRole: projectMemberRole,
                noProjects: false,
                noTaskboards: false
            })
            if ( foundProject ) {
                channelActions.joinProjectChannel(foundProject.project_id)
            }
        }
    }, [
        projects,
        project_id
    ])

    // Set noProjects global store state
    useLayoutEffect(() => {
        updateGlobalsStore({
            noProjects: (projects && !projectsIsFetching && projects.length < 1)
        })
    }, [projects, projectsIsFetching])

    return children;

}

export default StateManager_Project;