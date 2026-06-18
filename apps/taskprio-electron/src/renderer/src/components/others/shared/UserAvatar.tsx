import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace"
import React, { useMemo } from "react"
import WorkspaceMemberBadge from "./WorkspaceMemberBadge"
import { ProfilePhotoUrl } from "@/lib/globals"
import { EProfilePhotoSize } from "@repo/taskprio-types"
import { UserIcon } from "lucide-react"

export type TUserAvatarProps = {
  user_id_or_email: string,
  size?: "sm" | "md" | "lg" | "xl"
  disableHoverCard?: boolean
}

const UserAvatar: React.FC<TUserAvatarProps> = React.forwardRef<HTMLDivElement, TUserAvatarProps>(({
  user_id_or_email,
  size = "md",
  disableHoverCard = false
}, ref) => {

  const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

  const user = useMemo(() => {
    return selectedWorkspace?.workspace_members.find(member => member.user_id === user_id_or_email || member.email === user_id_or_email)
  }, [user_id_or_email, selectedWorkspace])

  if (disableHoverCard) {
    return (
      <div
        ref={ref}
        className={cn(
          `relative flex items-center justify-center rounded-full bg-gray-400 overflow-hidden `,
          size === "sm" && `size-[1.6rem]`,
          size === "md" && `size-[2.6rem]`,
          size === "lg" && `size-[3.6rem]`,
          size === "xl" && `size-[4.6rem]`
        )}
      >
        {
          user?.profile_photo?.photo_file_name ?
            <img
              loading="lazy"
              src={`${ProfilePhotoUrl}/${user?.user_id}/${user?.profile_photo?.photo_file_name?.replace(EProfilePhotoSize.ORIGINAL, EProfilePhotoSize.CROPPED_SMALL)}?v=${user.profile_photo.last_modified}`}
            />
            :
            <UserIcon className="size-[70%]" />
        }
      </div>
    )
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <div
            className={cn(
              `relative flex items-center justify-center rounded-full bg-gray-400 overflow-hidden `,
              size === "sm" && `size-[1.6rem]`,
              size === "md" && `size-[2.6rem]`,
              size === "lg" && `size-[3.6rem]`,
              size === "xl" && `size-[4.6rem]`
            )}
          >
            {
              user?.profile_photo?.photo_file_name ?
                <img
                  src={`${ProfilePhotoUrl}/${user?.user_id}/${user?.profile_photo?.photo_file_name?.replace(EProfilePhotoSize.ORIGINAL, EProfilePhotoSize.CROPPED_SMALL)}`}
                />
                :
                <UserIcon className="size-[70%]" />
            }
          </div>
        }
      />
      <HoverCardContent
        className={` !max-w-screen !w-fit `}
      >
        <div
          className={cn(
            ` flex gap-4 `
          )}
        >
          <span
            className={cn(
              ` relative shrink-0 size-[2.6rem] flex items-center justify-center rounded-full bg-gray-400 overflow-hidden `
            )}
          >
            {
              user?.profile_photo?.photo_file_name ?
                <img
                  src={`${ProfilePhotoUrl}/${user?.user_id}/${user?.profile_photo?.photo_file_name?.replace(EProfilePhotoSize.ORIGINAL, EProfilePhotoSize.CROPPED_SMALL)}`}
                />
                :
                <UserIcon className="size-[70%]" />
            }
          </span>
          <div
            className={cn(
              ` flex flex-col gap-1 `
            )}
          >
            <p className=" font-medium " >{user?.firstname} {user?.lastname}</p>
            <p className=" text-sm " >{user?.email}</p>
            {
              user?.workspace_role &&
              <WorkspaceMemberBadge
                role={user.workspace_role}
              />
            }
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )

})

export default UserAvatar;