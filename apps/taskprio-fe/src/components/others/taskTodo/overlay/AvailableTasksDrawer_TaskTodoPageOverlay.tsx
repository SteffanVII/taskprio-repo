import { cn } from "@/lib/utils";
import { useGetProjectListWithUserAssignedTasks } from "@/services/private/project/query";
import { updateTaskTodoPageStore, useTaskTodoPageStore_selectedProjectList_availableTaskDrawer } from "@/stores/taskTodoPage";
import React, { useLayoutEffect } from "react";
import { useParams } from "react-router";
import ProjectColumn from "../availableTasksSection/AvailableTasksSectionProjectColumn_TaskTodoPage";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

type TAvailableTasksDrawer_TaskTodoPageOverlayProps = {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AvailableTasksDrawer_TaskTodoPageOverlay: React.FC<TAvailableTasksDrawer_TaskTodoPageOverlayProps> = ({
    open,
    setOpen
}) => {

    const { workspace_id } = useParams()

    const selectedProjectList = useTaskTodoPageStore_selectedProjectList_availableTaskDrawer()

    const {
        data: projectListWithAssignedTasks,
        isLoading: projectListWithAssignedTasksIsLoading
    } = useGetProjectListWithUserAssignedTasks({
        payload: {
            workspace_id
        }
    })

    useLayoutEffect(() => {
        if (!selectedProjectList) {
            if (projectListWithAssignedTasks && projectListWithAssignedTasks.length > 0) {
                updateTaskTodoPageStore({
                    selectedProjectList_availableTaskDrawer: projectListWithAssignedTasks[0]
                })
            }
        }
    }, [
        selectedProjectList,
        projectListWithAssignedTasks
    ])

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                setOpen(open)
            }}
        >
            <DialogContent
                className={cn(
                    `flex flex-col`,
                    `h-[60%] min-h-0 `,
                    `!top-full !-translate-y-full rounded-b-none max-w-full`,
                    `overflow-hidden`
                )}
            >
                <DialogHeader>Add Task</DialogHeader>
                <div
                    className={cn(
                        `relative grid`,
                        `size-full pb-0 min-h-0`,
                        `overflow-hidden`
                    )}
                    style={{
                        gridTemplateRows: "min-content 1fr"
                    }}
                >
                    {
                        projectListWithAssignedTasksIsLoading ?
                            <Skeleton className="w-full h-[2rem]" />
                            :
                            <Select
                                items={projectListWithAssignedTasks?.map(projectList => ({
                                    value: projectList.project_id,
                                    label: projectList.project_name
                                }))}
                                defaultValue={selectedProjectList?.project_id}
                                onValueChange={value => {
                                    const foundProjectList = projectListWithAssignedTasks?.find(projectList => projectList.project_id === value)
                                    if (foundProjectList) {
                                        console.log(foundProjectList);
                                        updateTaskTodoPageStore({
                                            selectedProjectList_availableTaskDrawer: foundProjectList
                                        })
                                    }
                                }}
                            >
                                <SelectTrigger
                                    className={cn(
                                        "w-full font-bold",
                                        selectedProjectList && selectedProjectList.project_color !== "#ffffff" && getHexLuminance(selectedProjectList.project_color) > 0.4 ? `text-black` : `text-white`
                                    )}
                                    style={{
                                        backgroundColor: selectedProjectList ? selectedProjectList.project_color : undefined
                                    }}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        projectListWithAssignedTasks && projectListWithAssignedTasks.map(list => (
                                            <SelectItem
                                                key={list.project_id}
                                                value={list.project_id}
                                            >{list.project_name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                    }
                    <div
                        className={cn(
                            `size-full max-h-full min-h-0 overflow-hidden`
                        )}
                    >
                        {
                            selectedProjectList &&
                            <ProjectColumn
                                data={selectedProjectList}
                                visible
                                drawerMode
                            />
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )

}

export default AvailableTasksDrawer_TaskTodoPageOverlay;