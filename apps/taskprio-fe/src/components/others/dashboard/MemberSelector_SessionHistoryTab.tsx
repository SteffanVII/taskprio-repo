import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import { User } from "lucide-react";
import UserAvatar from "../shared/UserAvatar";
import { updateSessionHistoryTabStore, useSessionHistoryTabStore_selectedMembers } from "@/stores/sessionHistoryTab";
import { TWorkspaceMember } from "@repo/taskprio-types/src";



const MemberSelector_SessionHistoryTab = () => {

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const selectedMembers = useSessionHistoryTabStore_selectedMembers()

    const memberOnClick = ( member : TWorkspaceMember ) => {
        if ( selectedMembers.includes(member.user_id) ) {
            updateSessionHistoryTabStore({ selectedMembers : selectedMembers.filter( ( id ) => id !== member.user_id ) })
        } else {
            updateSessionHistoryTabStore({ selectedMembers : [ ...selectedMembers, member.user_id ] })
        }
    }

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant={"outline"}
                        size={ selectedMembers.length > 0 ? "default" : "icon" }
                    >
                        <User/>
                        {
                            selectedMembers.length > 0 &&
                            <div className="flex gap-2 ml-2" >
                                {
                                    selectedMembers.map( member => (
                                        <UserAvatar user_id_or_email={member} size="sm" disableHoverCard />
                                    ) )
                                }
                            </div>
                        }
                    </Button>
                }
            />
            <PopoverContent
                className={cn(
                    `p-2`
                )}
            >
                {
                    selectedWorkspace &&
                    selectedWorkspace.workspace_members.map( member => (
                        <Button
                            variant={ selectedMembers.includes(member.user_id) ? "default" : "ghost"}
                            className={"flex justify-start gap-4"}
                            onClick={() => memberOnClick(member)}
                        ><UserAvatar user_id_or_email={member.user_id} size="sm" disableHoverCard /> {member.firstname} {member.lastname}</Button>
                    ) )
                }
            </PopoverContent>
        </Popover>
    )

}

export default MemberSelector_SessionHistoryTab;