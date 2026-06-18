import { QueryKeys } from "@/services/enum";
import { useGlobalsStore, useGlobalsStore_user } from "@/stores/globals";
import { useProjectStore, useProjectStore_selectedProject } from "@/stores/project";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { TProject, TProjectCreatedWebSocketMessage, TProjectCustomizationUpdatedWebSocketMessage, TProjectDeactivatedSocketMessage, TProjectDroppedSocketMessage, TProjectMemberDeactivatedWebSocketMessage, TProjectMemberReactivatedWebSocketMessage, TProjectMemberRoleUpdatedWebSocketMessage, TProjectMembersAddedWebSocketMessage, TProjectReactivatedSocketMessage, TWebSocketMessage } from "@repo/taskprio-types";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import useLatest from "@/lib/hooks/useLates";
import { useGetUserProjectsByWorkspace, useResetGetUserProjectsByWorkspace, useUpdateUserProjectsByWorkspaceData } from "@/services/private/project/query";
import { useTaskboardStore } from "@/stores/taskboard";

const useProjectEventHandlers = () => {

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const userState = useGlobalsStore_user()
  const selectedWorkspaceState = useWorkspaceStore_selectedWorkspace()
  const selectedProjectState = useProjectStore_selectedProject()

  const setSelectedProject = useProjectStore(state => state.setSelectedProject)
  const setSelectedTask = useGlobalsStore(state => state.setSelectedTask)
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setNoTaskboards = useTaskboardStore(state => state.setNoTaskboards)
  const updateUserProjectsByWorkspaceData = useUpdateUserProjectsByWorkspaceData()
  const resetUserProjectsByWorkspace = useResetGetUserProjectsByWorkspace()

  const {
    data: projectsState
  } = useGetUserProjectsByWorkspace()

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
        setSelectedProject(null)
        setSelectedTask(null)
        setSelectedTaskboard(null)
        setNoTaskboards(false)
        navigate({
          to : "/workspace/$workspace_id/project",
          params : {
            workspace_id : selectedWorkspace.current.workspace_id
          }
        })
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
        setSelectedProject(null)
        setSelectedTask(null)
        setSelectedTaskboard(null)
        setNoTaskboards(false)
        navigate({
          to : "/workspace/$workspace_id/project",
          params : {
            workspace_id : selectedWorkspace.current.workspace_id
          }
        })
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
      setSelectedProject({
        ...selectedProject.current,
        ...message.message.data
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
        setSelectedProject({
          ...selectedProject.current,
          project_members : [
            ...selectedProject.current.project_members,
            ...message.message.members
          ]
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
        setSelectedProject({
          ...selectedProject.current,
          project_members : selectedProject.current.project_members.map( member => {
              if (member.user_id === message.message.member_id) {
                return {
                  ...member,
                  role: message.message.role
                }
              } else {
                return member
              }            
          } )
        })
      }
    }
  }

  const projectMemberDeactivatedWebSocketMessageHandler = async (message: TWebSocketMessage<TProjectMemberDeactivatedWebSocketMessage>) => {
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
          if (projects.current) {
            let newProjects = projects.current.filter(project => project.project_id !== message.message.project_id)
            updateUserProjectsByWorkspaceData(newProjects)
          }
          setSelectedProject(null)
          setSelectedTask(null)
          setSelectedTaskboard(null)
          setNoTaskboards(false)
          await resetUserProjectsByWorkspace()
          navigate({
            to : "/workspace/$workspace_id/project",
            params : {
              workspace_id : selectedWorkspace.current.workspace_id
            }
          })
        } else {
          if (projects.current) {
            const newProjects = projects.current.map(project => {
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
            updateUserProjectsByWorkspaceData(newProjects)
          }
          if (selectedProject.current) {
            let newSelectedProject = {
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
            setSelectedProject(newSelectedProject)
          } 
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