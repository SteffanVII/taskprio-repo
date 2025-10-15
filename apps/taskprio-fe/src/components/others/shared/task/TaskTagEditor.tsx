import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TTag, TTask, TTaskForCardView, TTaskTag } from "@repo/taskprio-types/src";
import { Check, CheckCircle2, Pencil } from "lucide-react";
import React, { useState } from "react";
import TagBadge from "../tag/TagBadge";
import { cn } from "@/lib/utils";
import { useGlobalsStore } from "@/stores/globals";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAddTaskTag, useRemoveTaskTag } from "@/services/private/task/mutation";

type TTaskTagEditorProps = {
    task : TTask | TTaskForCardView
}

const TaskTagEditor : React.FC<TTaskTagEditorProps> = ({
    task
}) => {

    const {
        selectedProject
    } = useGlobalsStore()

    const [ tags, setTags ] = useState<TTaskTag[]>(task.tags)

    const {
        mutateAsync : addTaskTagTrigger
    } = useAddTaskTag()

    const {
        mutateAsync : removeTaskTagTrigger
    } = useRemoveTaskTag()

    const onTagSelect = ( tag : TTag ) => {

        const tagExists = tags.find( t => t.tag_id === tag.tag_id )

        if ( tagExists ) {
            setTags( tags.filter( t => t.tag_id !== tag.tag_id ) )
            removeTaskTagTrigger({
                body : {
                    tag_id : tag.tag_id,
                    task_id : task.task_id
                }
            })
        } else {
            setTags( [ ...tags, {
                tag_name : tag.tag_name,
                tag_color : tag.tag_color,
                tag_id : tag.tag_id,
                task_id : task.task_id
            } ] )
            addTaskTagTrigger({
                body : {
                    tag_id : tag.tag_id,
                    task_id : task.task_id
                }
            })
        }

    }

    return (
        <div
            className=" flex flex-col justify-end gap-2 "
        >
            <Popover modal >
                <PopoverTrigger asChild>
                    <button
                        className={cn(
                            ` flex items-center gap-2 text-sm text-blue-400 cursor-pointer ml-auto `,
                            ` hover:text-blue-800 `
                        )}
                    ><Pencil className=" size-4 " /> Edit Tags</button>
                </PopoverTrigger>
                <PopoverContent
                    className=" p-2 "
                >
                    {
                        selectedProject && (
                            <ScrollArea className=" h-[20rem] " >
                                <div
                                    className="flex flex-col gap-2 "
                                >
                                    {
                                        selectedProject.project_tags.map( tag => (
                                            <div
                                                key={tag.tag_id}
                                                onClick={ () => onTagSelect( tag ) }
                                                className=" w-full flex gap-3 items-center cursor-pointer "
                                            >
                                                {
                                                    tags.find( t => t.tag_id === tag.tag_id ) && <CheckCircle2 className=" size-4 text-green-400 " />
                                                }
                                                <TagBadge
                                                    tag={tag}
                                                    className=" grow "
                                                />
                                            </div>
                                        ) )
                                    }
                                </div>
                            </ScrollArea>
                        )
                    }
                </PopoverContent>
            </Popover>
            <div
                className={cn(
                    ` flex flex-wrap justify-end gap-2 `
                )}
            >
                {
                    tags.map( tag => (
                        <TagBadge
                            tag={tag}
                            key={tag.tag_id}
                        />
                    ) )
                }
            </div>
        </div>
    )

}

export default TaskTagEditor;