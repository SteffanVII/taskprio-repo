import { Socket } from "socket.io";

export const onSocketIOConnect = (socket: Socket) => {

  socket.on("join-room", (workspaceId: string) => {
    socket.join(workspaceId)
  })

}