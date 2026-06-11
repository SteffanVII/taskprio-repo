import { cn } from "@/lib/utils"
import { TTag, TTaskTag } from "@repo/taskprio-types"
import React from "react"

type TTagBadgeProps = {
    tag: TTag | TTaskTag,
    size?: "sm" | "xs" | "default"
} & React.ComponentProps<"div">

const TagBadge: React.FC<TTagBadgeProps> = ({
    tag,
    className,
    size = "default",
    ...props
}) => {

    return (
        <div
            className={cn(
                ` flex items-center `,
                ` px-3 py-1 rounded border `,
                ` !font-extralight `,
                ` cursor-pointer `,
                ` hover:z-10 `,
                size === "sm" && ` text-xs px-2 py-0.5 `,
                size === "xs" && ` text-[0.7rem] px-1 py-0.25 `,
                className
            )}
            style={{
                borderColor: `${tag.tag_color}80`,
                backgroundColor: `${tag.tag_color}1a`,
                // color: getHexLuminance(tag.tag_color) > 0.5 ? "black" : "white"
            }}
            {...props}
        >
            <p
                className={cn(
                    ` text-sm font-medium `,
                    size === "sm" && ` text-normal font-normal `,
                    size === "xs" && ` text-[0.7rem] font-normal `,
                )}
            >{tag.tag_name}</p>
        </div>
    )

}

export default TagBadge;