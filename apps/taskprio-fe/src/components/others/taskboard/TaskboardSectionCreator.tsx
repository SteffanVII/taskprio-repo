import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCreateTaskboardSection } from "@/services/private/tasksection/mutation"
import { useGlobalsStore } from "@/stores/globals"
import { Plus } from "lucide-react"
import { useState } from "react"
import Spinner from "../Spinner"


export const TaskboardSectionCreator = () => {

    const {
        selectedTaskboard
    } = useGlobalsStore()

    const [ createSection, setCreateSection ] = useState(false)
    const [ sectionName, setSectionName ] = useState<string>("")

    const {
        mutateAsync : createTaskboardSection,
        isPending : isCreatingTaskboardSection
    } = useCreateTaskboardSection()

    const onSubmit = async () => {
        if ( sectionName.length === 0 ) return
        if ( !selectedTaskboard ) return
        await createTaskboardSection({
            body : {
                task_board_id : selectedTaskboard?.task_board_id,
                task_section_name : sectionName
            }
        })
        setSectionName("")
        setCreateSection(false)
    }

    return (
        <div
            className={cn(
                ` w-[20rem] min-w-[20rem] h-fit p-2 ml-4 `,
                ` shrink-0 `,
                createSection && ` p-0 `
            )}
            ref={(node) => {
                // Add click outside detection
                const handleClickOutside = (e: MouseEvent) => {
                    if (node && !node.contains(e.target as Node) && createSection) {
                        setCreateSection(false);
                    }
                };
                
                // Add event listener when component mounts
                document.addEventListener("mousedown", handleClickOutside);
                
                // Return cleanup function
                return () => {
                    document.removeEventListener("mousedown", handleClickOutside);
                };
            }}
        >
            {
                createSection ?
                <div
                    className=" flex flex-col gap-4 "
                >
                    <Input
                        placeholder="Section Name"
                        autoFocus
                        className=" h-[2.5rem] bg-white "
                        disabled={isCreatingTaskboardSection}
                        value={sectionName}
                        onChange={e => setSectionName(e.target.value)}
                    />
                    <div
                        className=" flex gap-2 justify-center flex-wrap "
                    >
                        <button
                            className=" size-6 border border-border rounded-sm bg-background"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-red-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-blue-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-green-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-yellow-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-purple-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-pink-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-indigo-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-teal-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-orange-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-cyan-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-lime-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-emerald-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-rose-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-amber-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-sky-500"
                        ></button>
                        <button
                            className=" size-6 border border-border rounded-sm bg-slate-500"
                        ></button>
                    </div>
                    <Button
                        variant={"outline"}
                        className=" w-full ml-auto "
                        disabled={isCreatingTaskboardSection}
                        onClick={onSubmit}
                    >
                        {
                            isCreatingTaskboardSection ?
                            <Spinner size="sm" />
                            :
                            "Create"
                        }
                    </Button>
                </div>
                :
                <button
                    className=" w-full flex gap-2 items-center text-muted-foreground "
                    onClick={() => setCreateSection( true )}
                ><Plus className="size-4" /> Add Section</button>
            }
        </div>
    )
}

export default TaskboardSectionCreator