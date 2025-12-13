import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useGlobalsStore_taskTodoPageShowAvailableTasks } from "@/stores/globals";
import { useTaskTodoPageStore_taskTodoPageCompactMode } from "@/stores/taskTodoPage";
import { useGetProjectListWithUserAssignedTasks } from "@/services/private/project/query";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectColumn from "./AvailableTasksSectionProjectColumn_TaskTodoPage";

const AvailableTasksSection_TaskTodoPage = () => {

    const { workspace_id } = useParams()
    const taskTodoPageCompactMode = useTaskTodoPageStore_taskTodoPageCompactMode()
    const taskTodoPageShowAvailableTasks = useGlobalsStore_taskTodoPageShowAvailableTasks()

    const [ projectColumnVisibility, setProjectColumnVisibility ] = useState<Record<string, boolean>>({})
    const columnsRefs = useRef<Record<string, HTMLDivElement>>({});
    const intersectionObserverRef = useRef<IntersectionObserver>(null)

    const {
        data : projectListWithAssignedTasks,
        isLoading : projectListWithAssignedTasksIsLoading
    } = useGetProjectListWithUserAssignedTasks({
        payload : {
            workspace_id
        }
    })

    useEffect(() => { 
        intersectionObserverRef.current = new IntersectionObserver(( entries ) => {
            const updates : Record<string, boolean> = {};
            entries.forEach( entry => {
                const projectColumnId = (entry.target as HTMLElement).dataset.projectColumnId;
                if (projectColumnId) {
                    updates[projectColumnId] = entry.isIntersecting;
                }
            } )
            setProjectColumnVisibility( prev => ({...prev, ...updates}) )
        }, {
            threshold: 0.5,
        })
        return () => {
            intersectionObserverRef.current?.disconnect()
        }
    }, [])

    useEffect(() => {
        const currentObserver = intersectionObserverRef.current;
        if (!currentObserver) return;

        // Disconnect previous observer
        currentObserver.disconnect();

        // Observe all task elements
        Object.keys(columnsRefs.current).forEach(taskId => {
            const element = document.querySelector(`[data-project-column-id="${taskId}"]`);
            if (element) {
                currentObserver.observe(element);
            }
        });

        return () => {
            currentObserver.disconnect();
        };
    }, [projectListWithAssignedTasks])

    return (
        <div
            className={cn(
                ` w-full h-full min-h-0 bg-background `,
                ` flex flex-col grow `,
                taskTodoPageCompactMode && `absolute bottom-0 left-0 translate-x-full w-full h-[calc(100%-3rem)] min-h-0 transition-transform duration-500 `,
                (taskTodoPageShowAvailableTasks && taskTodoPageCompactMode) && `translate-x-0`

            )}
            // style={{
            //     gridTemplateRows : "min-content 1fr"
            // }}
        >
            <div
                className={cn(
                    ` w-full h-full min-h-0 grow overflow-x-auto overflow-y-hidden `,
                    ` flex grow flex-nowrap space-x-4 `,
                    ` p-4 pb-0 `,
                    ` cursor-grab active:cursor-grabbing select-none `
                )}
                onMouseDown={ e => {
                
                    const el = e.currentTarget
                    const startX = e.pageX
                    const scrollLeft = el.scrollLeft
    
                    const onMouseMove = ( e : MouseEvent ) => {
                        const dx = e.pageX - startX
                        el.scrollLeft = scrollLeft - dx
                    }
    
                    const onMouseUp = () => {
                        document.removeEventListener("mousemove", onMouseMove)
                        document.removeEventListener("mouseup", onMouseUp)
                    }
    
                    document.addEventListener("mousemove", onMouseMove)
                    document.addEventListener("mouseup", onMouseUp)
                    
                } }
            >
                {
                    projectListWithAssignedTasksIsLoading &&
                    Array.from({ length : 5 }).map( (_, i) => (
                        <Skeleton
                            key={i}
                            className={cn(
                                `grow w-[25rem] h-full min-h-0`
                            )}
                        />
                    ) )
                }
                {
                    ( !projectListWithAssignedTasksIsLoading && projectListWithAssignedTasks && projectListWithAssignedTasks.length === 0 ) &&
                    <p className=" mx-auto mt-[8rem] text-lg font-semibold " >No available tasks</p>
                }
                {
                    ( !projectListWithAssignedTasksIsLoading && projectListWithAssignedTasks ) &&
                    projectListWithAssignedTasks.map( group => (
                        <ProjectColumn
                            ref={(el) => {
                                if (el) {
                                    columnsRefs.current[group.project_id] = el;
                                } else {
                                    delete columnsRefs.current[group.project_id];
                                }
                            }}
                            data={group}
                            visible={projectColumnVisibility[group.project_id] ? projectColumnVisibility[group.project_id] : false }
                        />
                    ) )
                }
            </div>

        </div>
    )

}

export default AvailableTasksSection_TaskTodoPage;