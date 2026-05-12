import { QueryKeys } from "@/services/enum";
import { updateGlobalsStore, useGlobalsStore_user } from "@/stores/globals";
import { updateTaskboardStore } from "@/stores/taskboard";
import { updateProjectStore, useProjectStore_projects, useProjectStore_selectedProject } from "@/stores/project";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { TProject, TProjectCreatedWebSocketMessage, TProjectCustomizationUpdatedWebSocketMessage, TProjectDeactivatedSocketMessage, TProjectDroppedSocketMessage, TProjectMemberDeactivatedWebSocketMessage, TProjectMemberReactivatedWebSocketMessage, TProjectMemberRoleUpdatedWebSocketMessage, TProjectMembersAddedWebSocketMessage, TProjectReactivatedSocketMessage, TWebSocketMessage } from "@repo/taskprio-types";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import useLatest from "@/lib/hooks/useLates";

const useProjectEventHandlers = () => {

    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const userState = useGlobalsStore_user()
    const projectsState = useProjectStore_projects()
    const selectedWorkspaceState = useWorkspaceStore_selectedWorkspace()
    const selectedProjectState = useProjectStore_selectedProject()

    const user = useLatest(userState)
    const projects = useLatest(projectsState)
    const selectedWorkspace = useLatest(selectedWorkspaceState)
    const selectedProject = useLatest(selectedProjectState)

    const projectDeactivatedWebSocketMessageHandler = (message: TWebSocketMessage<TProjectDeactivatedSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace.current?.workspace_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace.current?.workspace_id]
            })
            if (selectedProject.current?.project_id === message.message.project_id) {
                updateProjectStore({
                    selectedProject: null,
                })
                updateGlobalsStore({
                    selectedTask: null,
                })
                updateTaskboardStore({
                    selectedTaskboard: null,
                    noTaskboards: false
                })
                navigate(`/p/w/${selectedWorkspace.current?.workspace_id}/d`)
            }
        }
    }

    const projectDroppedWebSocketMessageHandler = (message: TWebSocketMessage<TProjectDroppedSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace.current?.workspace_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace.current?.workspace_id]
            })
            if (selectedProject.current?.project_id === message.message.project_id) {
                updateProjectStore({
                    selectedProject: null,
                })
                updateGlobalsStore({
                    selectedTask: null,
                })
                updateTaskboardStore({
                    selectedTaskboard: null,
                    noTaskboards: false
                })
                navigate(`/p/w/${selectedWorkspace.current?.workspace_id}/d`)
            }
        }
    }

    const projectReactivatedWebSocketMessageHandler = (message: TWebSocketMessage<TProjectReactivatedSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace.current?.workspace_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace.current?.workspace_id]
            })
        }
    }

    const projectCustomizationUpdatedwebSocketMessageHandler = (message: TWebSocketMessage<TProjectCustomizationUpdatedWebSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace.current?.workspace_id) {
            queryClient.setQueryData([
                ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id
            ], (prevData: TProject[]) => {
                return prevData.map((project) => {
                    if (project.project_id === message.message.data.project_id) {
                        return {
                            ...project,
                            ...message.message.data
                        }
                    } else {
                        return project
                    }
                })
            })
        }
        if (message.message.data.project_id === selectedProject.current?.project_id) {
            updateProjectStore({
                selectedProject: {
                    ...selectedProject.current,
                    ...message.message.data
                }
            })
        }
    }

    const projectCreatedWebSocketMessageHandler = (message: TWebSocketMessage<TProjectCreatedWebSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace.current?.workspace_id) {
            queryClient.setQueryData([
                ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id
            ], (prevData: TProject[]) => {
                return [
                    ...prevData,
                    message.message.data
                ]
            })
        }
    }

    const projectMembersAddedwebSocketMessage = (message: TWebSocketMessage<TProjectMembersAddedWebSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace.current?.workspace_id) {
            const projectId = message.message.members[0].project_id
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id],
                (prevData: TProject[]) => {
                    return produce(prevData, (draft) => {
                        const projectIndex = draft.findIndex((project) => project.project_id === projectId)
                        if (projectIndex !== -1) {
                            draft[projectIndex].project_members = [
                                ...draft[projectIndex].project_members,
                                ...message.message.members
                            ]
                        }
                    })
                }
            )
            if (selectedProject.current?.project_id === projectId) {
                updateProjectStore({
                    selectedProject: {
                        ...selectedProject.current!,
                        project_members: [
                            ...selectedProject.current!.project_members,
                            ...message.message.members
                        ]
                    }
                })
            }
        }
    }

    const projectMemberRoleUpdatedWebSocketMessage = (
        message: TWebSocketMessage<TProjectMemberRoleUpdatedWebSocketMessage>
    ) => {
        if (message.message.workspace_id === selectedWorkspace.current?.workspace_id) {
            const projectId = message.message.project_id
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id],
                (prevData: TProject[]) => {
                    return produce(prevData, (draft) => {
                        const projectIndex = draft.findIndex((project) => project.project_id === projectId)
                        if (projectIndex !== -1) {
                            draft[projectIndex].project_members = draft[projectIndex].project_members.map((member) => {
                                if (member.user_id === message.message.member_id) {
                                    return {
                                        ...member,
                                        role: message.message.role
                                    }
                                } else {
                                    return member
                                }
                            })
                        }
                    })
                }
            )
            if (selectedProject.current?.project_id === projectId) {
                updateProjectStore({
                    selectedProject: {
                        ...selectedProject.current!,
                        project_members: selectedProject.current!.project_members.map((member) => {
                            if (member.user_id === message.message.member_id) {
                                return {
                                    ...member,
                                    role: message.message.role
                                }
                            } else {
                                return member
                            }
                        })
                    }
                })
            }
        }
    }

    const projectMemberDeactivatedWebSocketMessageHandler = (message: TWebSocketMessage<TProjectMemberDeactivatedWebSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace.current?.workspace_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_PROJECT_MEMBERS.split, message.message.project_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace.current?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace.current?.workspace_id]
            })
            if (message.message.project_id === selectedProject.current?.project_id) {
                if (message.message.member_id === user.current?.user_id) {
                    toast.warning(`You've been deactivated from ${selectedProject.current?.project_name} project`)
                    let newProjects: TProject[] | undefined;
                    if (projects.current) {
                        newProjects = projects.current.filter(project => project.project_id !== message.message.project_id)
                    }
                    updateProjectStore({
                        projects: newProjects,
                        selectedProject: null,
                    })
                    updateGlobalsStore({
                        selectedTask: null,
                    })
                    updateTaskboardStore({
                        selectedTaskboard: null,
                        noTaskboards: false
                    })
                    navigate(`/p/w/${selectedWorkspace.current?.workspace_id}/d`)
                } else {
                    let newProjects: TProject[] | undefined;
                    let newSelectedProject: TProject | null | undefined;
                    if (projects.current) {
                        newProjects = projects.current.map(project => {
                            if (project.project_id === message.message.project_id) {
                                return {
                                    ...project,
                                    project_members: project.project_members.map(member => {
                                        if (member.user_id === message.message.member_id) {
                                            return {
                                                ...member,
                                                is_active: false
                                            }
                                        } else {
                                            return member
                                        }
                                    })
                                }
                            } else {
                                return project
                            }
                        })
                    }
                    if (selectedProject.current) {
                        newSelectedProject = {
                            ...selectedProject.current,
                            project_members: selectedProject.current.project_members.map(member => {
                                if (member.user_id === message.message.member_id) {
                                    return {
                                        ...member,
                                        is_active: false
                                    }
                                } else {
                                    return member
                                }
                            })
                        }
                    }
                    updateProjectStore({
                        projects: newProjects,
                        selectedProject: newSelectedProject
                    })
                }
            }
        }
    }

    const projectMemberReactivatedWebSocketMessageHandler = (message: TWebSocketMessage<TProjectMemberReactivatedWebSocketMessage>) => {
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, message.message.workspace_id]
        })
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_PROJECT_MEMBERS.split, message.message.project_id]
        })
        if (message.message.member_id === user.current?.user_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, message.message.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, message.message.workspace_id]
            })
        }
    }

    return {
        projectDeactivatedWebSocketMessageHandler,
        projectDroppedWebSocketMessageHandler,
        projectReactivatedWebSocketMessageHandler,
        projectCustomizationUpdatedwebSocketMessageHandler,
        projectCreatedWebSocketMessageHandler,
        projectMembersAddedwebSocketMessage,
        projectMemberRoleUpdatedWebSocketMessage,
        projectMemberDeactivatedWebSocketMessageHandler,
        projectMemberReactivatedWebSocketMessageHandler
    }

}

export default useProjectEventHandlers;