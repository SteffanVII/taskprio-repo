import { QueryKeys } from "@/services/enum";
import { updateGlobalsStore, useGlobalsStore_selectedProject, useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import { TProject, TProjectCreatedWebSocketMessage, TProjectCustomizationUpdatedWebSocketMessage, TProjectDeactivatedSocketMessage, TProjectDroppedSocketMessage, TProjectMemberRoleUpdatedWebSocketMessage, TProjectMembersAddedWebSocketMessage, TProjectReactivatedSocketMessage, TWebSocketMessage } from "@repo/taskprio-types/src";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";

const useProjectEventHandlers = () => {

    const queryClient = useQueryClient()
    const navigate = useNavigate()
    
    const {
        workspace_id,
        project_id
    } = useParams()

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const selectedProject = useGlobalsStore_selectedProject()

    const projectDeactivatedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TProjectDeactivatedSocketMessage> ) => {
        if ( message.message.workspace_id === workspace_id ) {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, workspace_id ]
            })
            if ( project_id === message.message.project_id ) {
                updateGlobalsStore({
                    selectedProject : null,
                    selectedTaskboard : null,
                    selectedTask : null,
                    noTaskboards : false
                })
                navigate(`/p/w/${workspace_id}/d`)
            }
        } 
    }, [
        workspace_id,
        project_id
    ])
    
    const projectDroppedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TProjectDroppedSocketMessage> ) => {
        if ( message.message.workspace_id === workspace_id ) {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, workspace_id ]
            })
            if ( project_id === message.message.project_id ) {
                updateGlobalsStore({
                    selectedProject : null,
                    selectedTaskboard : null,
                    selectedTask : null,
                    noTaskboards : false
                })
                navigate(`/p/w/${workspace_id}/d`)
            }
        } 
    }, [
        workspace_id,
        project_id
    ])

    const projectReactivatedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TProjectReactivatedSocketMessage> ) => {
        if ( message.message.workspace_id === workspace_id ) {
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_TASKS_ASSIGNED_TO_USER_BY_WORKSPACE.split, workspace_id ]
            })
            queryClient.invalidateQueries({
                queryKey : [ ...QueryKeys.GET_USER_TASK_TODO_STATE.split, workspace_id ]
            })
        }
    }, [workspace_id])

    const projectCustomizationUpdatedwebSocketMessageHandler = useCallback((
        message : TWebSocketMessage<TProjectCustomizationUpdatedWebSocketMessage>
    ) => {
        if ( message.message.workspace_id === workspace_id ) {
            queryClient.setQueryData([
                ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id
            ], ( prevData : TProject[] ) => {
                return prevData.map(( project ) => {
                    if ( project.project_id === message.message.data.project_id ) {
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
        if ( message.message.data.project_id === selectedProject?.project_id ) {
            updateGlobalsStore({
                selectedProject : {
                    ...selectedProject,
                    ...message.message.data
                }
            })
        }
    }, [workspace_id, selectedProject])

    const projectCreatedWebSocketMessageHandler = useCallback(( message : TWebSocketMessage<TProjectCreatedWebSocketMessage> ) => {
        if ( message.message.workspace_id === workspace_id ) {
            queryClient.setQueryData([
                ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, workspace_id
            ], ( prevData : TProject[] ) => {
                return [
                    ...prevData,
                    message.message.data
                ]
            })
        }
    }, [workspace_id])

    const projectMembersAddedwebSocketMessage = useCallback((
        message : TWebSocketMessage<TProjectMembersAddedWebSocketMessage>
    ) => {
        if ( message.message.workspace_id === selectedWorkspace?.workspace_id ) {
            const projectId = message.message.members[0].project_id
            queryClient.setQueryData(
                [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id ],
                ( prevData : TProject[] ) => {
                    return produce( prevData, ( draft ) => {
                        const projectIndex = draft.findIndex(( project ) => project.project_id === projectId)
                        if ( projectIndex !== -1 ) {
                            draft[projectIndex].project_members = [
                                ...draft[projectIndex].project_members,
                                ...message.message.members
                            ]
                        }
                    })
                }
            )
            if ( selectedProject?.project_id === projectId ) {
                updateGlobalsStore({
                    selectedProject : {
                        ...selectedProject,
                        project_members : [
                            ...selectedProject.project_members,
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
        message : TWebSocketMessage<TProjectMemberRoleUpdatedWebSocketMessage>
    ) => {
        if ( message.message.workspace_id === selectedWorkspace?.workspace_id ) {
            const projectId = message.message.project_id
            queryClient.setQueryData(
                [ ...QueryKeys.GET_USER_PROJECTS_BY_WORKSPACE.split, selectedWorkspace?.workspace_id ],
                ( prevData : TProject[] ) => {
                    return produce( prevData, ( draft ) => {
                        const projectIndex = draft.findIndex(( project ) => project.project_id === projectId)
                        if ( projectIndex !== -1 ) {
                            draft[projectIndex].project_members = draft[projectIndex].project_members.map(( member ) => {
                                if ( member.user_id === message.message.member_id ) {
                                    return {
                                        ...member,
                                        role : message.message.role
                                    }
                                } else {
                                    return member
                                }
                            })
                        }
                    })
                }
            )
            if ( selectedProject?.project_id === projectId ) {
                updateGlobalsStore({
                    selectedProject : {
                        ...selectedProject,
                        project_members : selectedProject.project_members.map(( member ) => {
                            if ( member.user_id === message.message.member_id ) {
                                return {
                                    ...member,
                                    role : message.message.role
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

    return useMemo(() => ({
        projectDeactivatedWebSocketMessageHandler,
        projectDroppedWebSocketMessageHandler,
        projectReactivatedWebSocketMessageHandler,
        projectCustomizationUpdatedwebSocketMessageHandler,
        projectCreatedWebSocketMessageHandler,
        projectMembersAddedwebSocketMessage,
        projectMemberRoleUpdatedWebSocketMessage
    }), [
        projectDeactivatedWebSocketMessageHandler,
        projectDroppedWebSocketMessageHandler,
        projectReactivatedWebSocketMessageHandler,
        projectCustomizationUpdatedwebSocketMessageHandler,
        projectCreatedWebSocketMessageHandler,
        projectMembersAddedwebSocketMessage,
        projectMemberRoleUpdatedWebSocketMessage
    ])

}

export default useProjectEventHandlers;