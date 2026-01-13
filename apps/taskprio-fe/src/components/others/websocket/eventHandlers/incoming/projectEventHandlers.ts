import { QueryKeys } from "@/services/enum";
import { updateGlobalsStore, useGlobalsStore_user } from "@/stores/globals";
import { updateTaskboardStore } from "@/stores/taskboard";
import { updateProjectStore, useProjectStore_projects, useProjectStore_selectedProject } from "@/stores/project";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { TProject, TProjectCreatedWebSocketMessage, TProjectCustomizationUpdatedWebSocketMessage, TProjectDeactivatedSocketMessage, TProjectDroppedSocketMessage, TProjectMemberDeactivatedWebSocketMessage, TProjectMemberReactivatedWebSocketMessage, TProjectMemberRoleUpdatedWebSocketMessage, TProjectMembersAddedWebSocketMessage, TProjectReactivatedSocketMessage, TWebSocketMessage } from "@repo/taskprio-types/src";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const useProjectEventHandlers = () => {

    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const user = useGlobalsStore_user()
    const projects = useProjectStore_projects()
    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()
    const selectedProject = useProjectStore_selectedProject()

    const projectDeactivatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TProjectDeactivatedSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace?.workspace_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id]
            })
            if (selectedProject?.project_id === message.message.project_id) {
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
                navigate(`/p/w/${selectedWorkspace?.workspace_id}/d`)
            }
        }
    }, [
        selectedWorkspace?.workspace_id,
        selectedProject?.project_id
    ])

    const projectDroppedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TProjectDroppedSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace?.workspace_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id]
            })
            if (selectedProject?.project_id === message.message.project_id) {
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
                navigate(`/p/w/${selectedWorkspace?.workspace_id}/d`)
            }
        }
    }, [
        selectedWorkspace?.workspace_id,
        selectedProject?.project_id
    ])

    const projectReactivatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TProjectReactivatedSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace?.workspace_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id]
            })
        }
    }, [selectedWorkspace?.workspace_id])

    const projectCustomizationUpdatedwebSocketMessageHandler = useCallback((
        message: TWebSocketMessage<TProjectCustomizationUpdatedWebSocketMessage>
    ) => {
        if (message.message.workspace_id === selectedWorkspace?.workspace_id) {
            queryClient.setQueryData([
                ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id
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
        if (message.message.data.project_id === selectedProject?.project_id) {
            updateProjectStore({
                selectedProject: {
                    ...selectedProject,
                    ...message.message.data
                }
            })
        }
    }, [selectedWorkspace?.workspace_id, selectedProject])

    const projectCreatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TProjectCreatedWebSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace?.workspace_id) {
            queryClient.setQueryData([
                ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id
            ], (prevData: TProject[]) => {
                return [
                    ...prevData,
                    message.message.data
                ]
            })
        }
    }, [selectedWorkspace?.workspace_id])

    const projectMembersAddedwebSocketMessage = useCallback((
        message: TWebSocketMessage<TProjectMembersAddedWebSocketMessage>
    ) => {
        if (message.message.workspace_id === selectedWorkspace?.workspace_id) {
            const projectId = message.message.members[0].project_id
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id],
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
            if (selectedProject?.project_id === projectId) {
                updateProjectStore({
                    selectedProject: {
                        ...selectedProject!,
                        project_members: [
                            ...selectedProject!.project_members,
                            ...message.message.members
                        ]
                    }
                })
            }
        }
    }, [
        selectedWorkspace,
        selectedProject
    ])

    const projectMemberRoleUpdatedWebSocketMessage = useCallback((
        message: TWebSocketMessage<TProjectMemberRoleUpdatedWebSocketMessage>
    ) => {
        if (message.message.workspace_id === selectedWorkspace?.workspace_id) {
            const projectId = message.message.project_id
            queryClient.setQueryData(
                [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id],
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
            if (selectedProject?.project_id === projectId) {
                updateProjectStore({
                    selectedProject: {
                        ...selectedProject!,
                        project_members: selectedProject!.project_members.map((member) => {
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
    }, [
        selectedWorkspace,
        selectedProject
    ])

    const projectMemberDeactivatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TProjectMemberDeactivatedWebSocketMessage>) => {
        if (message.message.workspace_id === selectedWorkspace?.workspace_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
            })
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_PROJECT_MEMBERS.split, message.message.project_id]
            })
            if (message.message.project_id === selectedProject?.project_id) {
                queryClient.invalidateQueries({
                    queryKey: [...QueryKeys.GET_USER_TASK_TODO_STATE.split, selectedWorkspace?.workspace_id]
                })
                queryClient.invalidateQueries({
                    queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, selectedWorkspace?.workspace_id]
                })
                if (message.message.member_id === user?.user_id) {
                    toast.warning(`You've been deactivated from ${selectedProject?.project_name} project`)
                    let newProjects: TProject[] | undefined;
                    if (projects) {
                        newProjects = projects.filter(project => project.project_id !== message.message.project_id)
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
                    navigate(`/p/w/${selectedWorkspace?.workspace_id}/d`)
                } else {
                    let newProjects: TProject[] | undefined;
                    let newSelectedProject: TProject | null | undefined;
                    if (projects) {
                        newProjects = projects.map(project => {
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
                    if (selectedProject) {
                        newSelectedProject = {
                            ...selectedProject,
                            project_members: selectedProject.project_members.map(member => {
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
    }, [
        selectedWorkspace?.workspace_id,
        user,
        selectedProject,
        projects
    ])

    const projectMemberReactivatedWebSocketMessageHandler = useCallback((message: TWebSocketMessage<TProjectMemberReactivatedWebSocketMessage>) => {
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, message.message.workspace_id]
        })
        queryClient.invalidateQueries({
            queryKey: [...QueryKeys.GET_PROJECT_MEMBERS.split, message.message.project_id]
        })
        if (message.message.member_id === user?.user_id) {
            queryClient.invalidateQueries({
                queryKey: [...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, message.message.workspace_id]
            })
        }
    }, [
        user,
        selectedWorkspace?.workspace_id
    ])

    return useMemo(() => ({
        projectDeactivatedWebSocketMessageHandler,
        projectDroppedWebSocketMessageHandler,
        projectReactivatedWebSocketMessageHandler,
        projectCustomizationUpdatedwebSocketMessageHandler,
        projectCreatedWebSocketMessageHandler,
        projectMembersAddedwebSocketMessage,
        projectMemberRoleUpdatedWebSocketMessage,
        projectMemberDeactivatedWebSocketMessageHandler,
        projectMemberReactivatedWebSocketMessageHandler
    }), [
        projectDeactivatedWebSocketMessageHandler,
        projectDroppedWebSocketMessageHandler,
        projectReactivatedWebSocketMessageHandler,
        projectCustomizationUpdatedwebSocketMessageHandler,
        projectCreatedWebSocketMessageHandler,
        projectMembersAddedwebSocketMessage,
        projectMemberRoleUpdatedWebSocketMessage,
        projectMemberDeactivatedWebSocketMessageHandler,
        projectMemberReactivatedWebSocketMessageHandler
    ])

}

export default useProjectEventHandlers;