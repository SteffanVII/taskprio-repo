import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCreateTaskboardSection } from "@/services/private/tasksection/mutation"
import { useTaskboardStore_selectedTaskboard } from "@/stores/taskboard"

import { Plus } from "lucide-react"
import { useState } from "react"
import Spinner from "../Spinner"
import { taskSectionColors } from "@/lib/utils/shared"
import getHexLuminance from "@/lib/utils/hexColorLuminance"

export const TaskboardSectionCreator = () => {

  const selectedTaskboard = useTaskboardStore_selectedTaskboard()

  const [createSection, setCreateSection] = useState(false)
  const [sectionName, setSectionName] = useState<string>("")
  const [sectionColor, setSectionColor] = useState<string>("#ffffff")

  const {
    mutateAsync: createTaskboardSection,
    isPending: isCreatingTaskboardSection
  } = useCreateTaskboardSection()

  const onSubmit = async () => {
    if (sectionName.length === 0) return
    if (!selectedTaskboard) return
    await createTaskboardSection({
      body: {
        task_board_id: selectedTaskboard?.task_board_id,
        task_section_name: sectionName,
        task_section_color: sectionColor
      }
    })
    setSectionName("")
    setCreateSection(false)
  }

  return (
    <div
      className={cn(
        ` w-[20rem] min-w-[20rem] h-fit mr-[6rem] `,
        ` shrink-0 `,
        ` first:ml-[1.5rem] `,
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
                ` h-[2.5rem] bg-white border-0 border-l-8 !text-sm !rounded `,
                ` placeholder:text-[${getHexLuminance(sectionColor) > 0.4 ? "#000000" : "#ffffff"}] `
              )}
              style={{
                borderColor: sectionColor,
                backgroundColor: `${sectionColor}1a`,
                // color: getHexLuminance(sectionColor) > 0.4 ? "#000000" : "#ffffff"
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
                      sectionColor === color && ` -translate-y-1 shadow-lg `
                    )}
                    style={{
                      backgroundColor: color
                    }}
                    onClick={() => setSectionColor(color)}
                  ></button>
                ))
              }
            </div>
            <Button
              variant={"outline"}
              className=" w-full ml-auto "
              disabled={isCreatingTaskboardSection || sectionName.length === 0}
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
          <Button
            variant={"outline"}
            className="flex justify-start w-full h-[2.5rem] gap-2 cursor-pointer "
            onClick={() => setCreateSection(true)}
          ><Plus className="size-4" /> Add Section</Button>
      }
    </div>
  )
}

export default TaskboardSectionCreator