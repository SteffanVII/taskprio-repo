import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCreateTaskboardSection } from "@/services/private/tasksection/mutation"
import { useGlobalsStore_selectedTaskboard } from "@/stores/globals"

import { Plus } from "lucide-react"
import { useState } from "react"
import Spinner from "../Spinner"
import { taskSectionColors } from "@/lib/utils/shared"
import getHexLuminance from "@/lib/utils/hexColorLuminance"

export const TaskboardSectionCreator = () => {

    const selectedTaskboard = useGlobalsStore_selectedTaskboard()

    const [ createSection, setCreateSection ] = useState(false)
    const [ sectionName, setSectionName ] = useState<string>("")
    const [ sectionColor, setSectionColor ] = useState<string>("#ffffff")

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
                task_section_name : sectionName,
                task_section_color : sectionColor
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
                        key={sectionColor}
                        placeholder="Section Name"
                        autoFocus
                        className={cn(
                            ` h-[2.5rem] bg-white `,
                            ` placeholder:text-[${getHexLuminance(sectionColor) > 0.4 ? "#000000" : "#ffffff"}] `
                        )}
                        style={{
                            backgroundColor : sectionColor,
                            color : getHexLuminance(sectionColor) > 0.4 ? "#000000" : "#ffffff"
                        }}
                        disabled={isCreatingTaskboardSection}
                        value={sectionName}
                        onChange={e => setSectionName(e.target.value)}
                    />
                    <div
                        className=" flex gap-2 justify-center flex-wrap "
                    >
                        {
                            taskSectionColors.map((color) => (
                                <button
                                    key={color}
                                    className={cn(
                                        " size-8 rounded-sm transition-all duration-200 ",
                                        sectionColor === color && ` -translate-y-1 shadow-lg shadow-foreground/50 `
                                    )}
                                    style={{
                                        backgroundColor : color
                                    }}
                                    onClick={() => setSectionColor(color)}
                                ></button>
                            ))
                        }
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