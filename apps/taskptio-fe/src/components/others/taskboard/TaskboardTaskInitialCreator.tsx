import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TTaskboardTaskInitialCreatorProps = {
    outOfFocusCallback : ( taskTitle : string ) => void
}

export const TaskboardTaskInitialCreator : React.FC<TTaskboardTaskInitialCreatorProps> = ( {
    outOfFocusCallback
} ) => {

    const [ taskTitle, setTaskTitle ] = useState("")

    return (
        <div
            className={cn(
                ` w-[20rem] min-w-[20rem] h-fit mt-4 `,
                ` bg-background border border-border rounded-md `
            )}
        >
            <Input
                autoFocus
                className={cn(
                    ` border-none shadow-none `
                )}
                value={taskTitle}
                onChange={ e => {
                    setTaskTitle( e.target.value )
                } }
                onBlur={() => {
                    outOfFocusCallback( taskTitle )
                }}
                onKeyDown={ e => {
                    if (e.key === 'Enter') {
                        e.currentTarget.blur()
                    }
                }}
            />
        </div>
    )

}

export default TaskboardTaskInitialCreator;