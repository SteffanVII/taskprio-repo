import { WebSocketContext } from "@/components/others/websocket/WebsocketProvider"
import { useGetProjectTaskboards } from "@/services/private/taskboard/query"
import { useTaskboardStore, useTaskboardStore_selectedTaskboard } from "@/stores/taskboard"
import { useProjectStore_selectedProject } from "@/stores/project"
import React, { useContext, useEffect, useLayoutEffect } from "react"
import { useParams } from "@tanstack/react-router"

type TStateManager_Taskboard = {
  children: React.ReactNode
}

const StateManager_Taskboard: React.FC<TStateManager_Taskboard> = ({ children }) => {

  const { project_id, taskboard_id } = useParams({ strict: false })
  const {
    channelActions
  } = useContext(WebSocketContext)

  const selectedProject = useProjectStore_selectedProject()
  const selectedTaskboard = useTaskboardStore_selectedTaskboard()
  const setSelectedTaskboard = useTaskboardStore(state => state.setSelectedTaskboard)
  const setNoTaskboards = useTaskboardStore(state => state.setNoTaskboards)

  const {
    data: taskboards,
    isFetching: taskboardsIsFetching
  } = useGetProjectTaskboards({
    payload: {
      query: {
        project_id: project_id
      }
    },
    options: {
      enabled: !!selectedProject
    }
  })

  useEffect(() => {
    setNoTaskboards((taskboards && taskboards.length < 1) ?? false)
  }, [
    taskboards
  ])

  // Update the selected taskboard in the globals store
  useLayoutEffect(() => {
    if (!selectedTaskboard && taskboard_id) {
      const foundTaskboard = taskboards?.find(taskboard => taskboard.task_board_id === taskboard_id) ?? null
      setSelectedTaskboard(foundTaskboard)
      setNoTaskboards(false)
      if (foundTaskboard) {
        channelActions.joinTaskboardChannel(foundTaskboard.task_board_id)
      }
    }
  }, [taskboards, taskboard_id, selectedTaskboard])

  // Set noTaskboards global store state
  useLayoutEffect(() => {
    setNoTaskboards((taskboards && !taskboardsIsFetching && taskboards.length < 1) ?? false)
  }, [taskboards, taskboardsIsFetching])

  return children;

}

export default StateManager_Taskboard;