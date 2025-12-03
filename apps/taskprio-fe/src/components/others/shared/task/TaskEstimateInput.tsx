import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatDurationString, isValidDurationString, parseDurationString } from "@/lib/utils/durationFormatter"
import { Check, Pencil, Plus, X } from "lucide-react"
import React, { useMemo, useState } from "react"

export type TTaskEstimateInputProps = {
    estimate : number | null,
    setEstimate : ( estimate : number | null ) => void
}

const TaskEstimateInput : React.FC<TTaskEstimateInputProps> = ({
    estimate,
    setEstimate
}) => {

    const [ isEditing, setIsEditing ] = useState<boolean>( false)
    const [ inputValue, setInputValue ] = useState<string>( formatDurationString( estimate ) )

    const isValidEstimateText = useMemo(() => {
        return isValidDurationString( inputValue )
    }, [ inputValue ])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
    };

    const handleSave = () => {
        if ( !isValidEstimateText ) return
        setEstimate( parseDurationString( inputValue ) )
        setIsEditing( false )
    }

    return (
        <div
            className={cn(
                ` flex justify-end items-center gap-2 `
            )}
        >
            {
                isEditing ? (
                    <div className=" flex flex-col gap-2 ">
                        <Input
                            value={inputValue}
                            onChange={handleInputChange}
                        />
                        <div className=" flex justify-end  gap-2 " >
                            <Button
                                variant={"outline"}
                                size={"icon"}
                                onClick={handleSave}
                                disabled={ !isValidEstimateText }
                            ><Check className="size-[1rem]" /></Button>
                            <Button
                                variant={"outline"}
                                size={"icon"}
                                onClick={() => setIsEditing( false )}
                            ><X className="size-[1rem]" /></Button>
                        </div>
                    </div>
                ) :
                (
                    estimate ? (
                        <>
                            <button
                                className={cn(
                                    ` flex items-center gap-2 text-sm text-primary cursor-pointer `,
                                    ` hover:text-primary `
                                )}
                                onClick={() => {
                                    setInputValue( formatDurationString( estimate ) )
                                    setIsEditing( true )
                                }}
                            >
                                <Pencil className="size-[1rem]" />
                            </button>
                            <Badge
                                variant={"outline"}
                                className={cn(
                                    ` text-sm `
                                )}
                            >{ formatDurationString( estimate ) }</Badge>
                        </>
                    ) : (
                        <button
                            className={cn(
                                ` flex items-center gap-2 text-sm text-primary cursor-pointer `,
                                ` hover:text-primary hover:underline `
                            )}
                            onClick={() => setIsEditing( true )}
                        ><Plus className={"size-[1rem]"} />Set Estimate</button>
                    )
                )
            }
        </div>
    )

}

export default TaskEstimateInput;