import { TTask, TUserSecure } from "@repo/taskprio-types";
import { createContext, useState } from "react";

export type TGlobalsContext = {
    authenticated: boolean,
    authenticateIsPending: boolean,
    logoutIsPending: boolean,
    user: TUserSecure | null,
    invitationRecipient: TUserSecure | null,
    selectedTask: TTask | null,
    taskTodoPageShowAvailableTasks: boolean,
    setAuthenticated: (authenticated: boolean) => void,
    setAuthenticateIsPending: (authenticateIsPending: boolean) => void,
    setLogoutIsPending: (logoutIsPending: boolean) => void,
    setUser: (user: TUserSecure | null) => void,
    setInvitationRecipient: (invitationRecipient: TUserSecure | null) => void,
    setSelectedTask: (selectedTask: TTask | null) => void,
    setTaskTodoPageShowAvailableTasks: (taskTodoPageShowAvailableTasks: boolean) => void
}

export const GlobalContext = createContext<TGlobalsContext>({
  authenticated: false,
  authenticateIsPending: true,
  logoutIsPending: false,
  user: null,
  invitationRecipient: null,
  selectedTask: null,
  taskTodoPageShowAvailableTasks: false,
  setAuthenticated: () => {},
  setAuthenticateIsPending: () => {},
  setLogoutIsPending: () => {},
  setUser: () => {},
  setInvitationRecipient: () => {},
  setSelectedTask: () => {},
  setTaskTodoPageShowAvailableTasks: () => {}
})

export const GlobalContextProvider = ({
  children
}: {
  children: React.ReactNode
}) => {

  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [authenticateIsPending, setAuthenticateIsPending] = useState<boolean>(true);
  const [logoutIsPending, setLogoutIsPending] = useState<boolean>(false);

  const [user, setUser] = useState<TUserSecure | null>(null);

  const [invitationRecipient, setInvitationRecipient] = useState<TUserSecure | null>(null);
  const [selectedTask, setSelectedTask] = useState<TTask | null>(null);

  const [taskTodoPageShowAvailableTasks, setTaskTodoPageShowAvailableTasks] = useState<boolean>(false);

  return (
    <GlobalContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        authenticateIsPending,
        setAuthenticateIsPending,
        logoutIsPending,
        setLogoutIsPending,
        user,
        setUser,
        invitationRecipient,
        setInvitationRecipient,
        selectedTask,
        setSelectedTask,
        taskTodoPageShowAvailableTasks,
        setTaskTodoPageShowAvailableTasks
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}