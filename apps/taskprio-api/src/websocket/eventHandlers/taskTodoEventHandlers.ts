import WebSocket from "ws";
import { TTaskTodoTimerHeartbeatWebSocketMesssage, TWebSocketMessage } from "@repo/taskprio-types";
import { updateTaskTodoTimerLastSeen } from "../../database/queries/todo/mutation.js";
import { taskTodoTimerHeartbeatTimeoutManager } from "../../initializers/taskTodoTimerHeartbeatTimeoutManager.js";

export const taskTodoTimerHeartbeatEventHandler = async ( ws : WebSocket, payload : TWebSocketMessage<TTaskTodoTimerHeartbeatWebSocketMesssage> ) => {
    console.log("Task todo timer heartbeat event handler", payload.message.workspace_id);
    try {
        const { task_id, workspace_id } = payload.message;
        const updatedTaskTodoTimer = await updateTaskTodoTimerLastSeen(
            task_id,
            ws.user_id,
            workspace_id
        )
        console.log(updatedTaskTodoTimer);
        console.log(`${ws.user_id}-${task_id} Timer Updating`)
        await taskTodoTimerHeartbeatTimeoutManager.udpateTaskTodoTimerHeartbeatTimeout(
            task_id,
            ws.user_id,
            updatedTaskTodoTimer.last_seen
        )
    } catch( error ) {
        console.error( error );
    }
}