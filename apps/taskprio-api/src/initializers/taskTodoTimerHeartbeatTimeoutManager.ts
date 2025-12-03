import { startOrStopTaskTimer } from "../database/queries/todo/mutation.js"
import { getAllActiveTaskTodoTimers } from "../database/queries/todo/query.js"
import dayjs from "../utilities/dayjs.js"

type TTaskTodoTimerHeartbeatTimeout = {
    userId : string,
    taskId : string,
    timeout : NodeJS.Timeout
}

export let taskTodoTimerHeartbeatTimeoutManager : TaskTodoTimerHeartbeatTimeoutManager;

export class TaskTodoTimerHeartbeatTimeoutManager {

    private taskTodoTimerHeartbeatTimeouts : Map<string, TTaskTodoTimerHeartbeatTimeout>;

    constructor() {
        this.taskTodoTimerHeartbeatTimeouts = new Map()
    }

    async init() {
        try {
            const activeTimers = await getAllActiveTaskTodoTimers()
            await Promise.all( activeTimers.map( async ( timer ) => {

                const lastSeen = dayjs.utc(timer.last_seen)
                const now = dayjs.utc()
                const diff = now.diff(lastSeen, "minute")
                // If the difference between the current time and the last seen is greater than or equal to 5 minutes
                // Then the timer need to be stopped
                if ( diff >= 5 ) {
                    await startOrStopTaskTimer(
                        timer.user_id,
                        timer.task_id
                    )
                } else {
                    // Else create a timeout to stop the timer if the last seen is not updated within 5 minutes
                    const timeoutMinutes = lastSeen.add(5, "minute").diff(now, "minute")
                    this.taskTodoTimerHeartbeatTimeouts.set(
                        `${timer.user_id}-${timer.task_id}`,
                        {
                            userId : timer.user_id,
                            taskId : timer.task_id,
                            timeout : setTimeout( async () => {
                                await startOrStopTaskTimer(
                                    timer.user_id,
                                    timer.task_id
                                )
                                this.taskTodoTimerHeartbeatTimeouts.delete(`${timer.user_id}-${timer.task_id}`)
                            }, timeoutMinutes * 60 * 1000 )
                        }
                    )
                }

            } ) )
        } catch ( error ) {
            console.error( error )
            throw new Error( "There was a problem initializing the task todo timer heartbeat service workers" )
        }
    }

    async udpateTaskTodoTimerHeartbeatTimeout(
        taskId : string,
        userId : string,
        lastSeen : string
    ) {
        const existingTimeout = this.taskTodoTimerHeartbeatTimeouts.get(`${userId}-${taskId}`)
        if ( existingTimeout ) {
            clearTimeout(existingTimeout.timeout)
        }
        const lastSeenDayjs = dayjs.utc(lastSeen).add(5, "minute" )
        const now = dayjs.utc()
        const timeoutMinutes = lastSeenDayjs.diff( now, "minute" )
        this.taskTodoTimerHeartbeatTimeouts.set(
            `${userId}-${taskId}`,
            {
                userId : userId,
                taskId : taskId,
                timeout : setTimeout( async () => {
                    await startOrStopTaskTimer(
                        userId,
                        taskId
                    )
                    this.taskTodoTimerHeartbeatTimeouts.delete(`${userId}-${taskId}`)
                }, timeoutMinutes * 60 * 1000 )
            }
        )
    }

    async clearTaskTOdoTimerHeartbeatTimeout(
        taskId : string,
        userId : string
    ) {
        const foundHeartbeatTimeout = this.taskTodoTimerHeartbeatTimeouts.get(`${userId}-${taskId}`)
        if ( foundHeartbeatTimeout ) {
            clearTimeout(foundHeartbeatTimeout.timeout)
            this.taskTodoTimerHeartbeatTimeouts.delete(`${userId}-${taskId}`)
        }
    }

}

export const initializeTaskTodoTimerHeartbeatTimeouts = async() => {
    taskTodoTimerHeartbeatTimeoutManager = new TaskTodoTimerHeartbeatTimeoutManager()
    await taskTodoTimerHeartbeatTimeoutManager.init()
}