import { cn } from "@/lib/utils";
import { EWorkspaceRole, TWorkspaceMember } from "@repo/taskprio-types/src";
import React, { createContext, useContext, useEffect, useState } from "react";
import UserAvatar from "../shared/UserAvatar";
import WorkspaceMemberBadge from "../shared/WorkspaceMemberBadge";
import { useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlusIcon } from "lucide-react";
import { updateDialogsStore } from "@/stores/dialogs";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dayjs from "dayjs";
import { Label } from "@/components/ui/label";
import { useUpdateWorkspaceMemberRole } from "@/services/private/workspace/mutation";
import { toast } from "sonner";
import { useGetWorkspaceMember } from "@/services/private/workspace/query";
import Spinner from "../Spinner";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";

type TMembersSectionContext = {
    selectedMember : TWorkspaceMember | null
    setSelectedMember : ( member : TWorkspaceMember | null ) => void
}

const MembersSectionContenxt = createContext<TMembersSectionContext>({
    selectedMember : null,
    setSelectedMember : () => {}
})

export const Members_WorkspaceSettingsPage = () => {

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

    const [ selectedMember, setSelectedMember ] = useState<TWorkspaceMember | null>(null)

    const handleInviteMemberOnClick = () => {
        updateDialogsStore({
            workspaceInvitationDialog : {
                open : true
            }
        })
    }

    return (
        <>
            <MembersSectionContenxt.Provider
                value={{
                    selectedMember,
                    setSelectedMember
                }}
            >
                <div className=" flex flex-col space-y-2 " >
                    <h3 className={` text-lg font-medium `} >Members</h3>
                    <p className=" text-sm text-muted-foreground " >
                        Manage the workspace members
                    </p>
                </div>
                <div
                    className={cn(
                        `flex flex-col gap-4`
                    )}
                >
                    {
                        isUserWorkspaceOwnerOrAdmin &&
                        <div
                            className={cn(
                                `flex gap-4`
                            )}
                        >
                            <Button
                                onClick={handleInviteMemberOnClick}
                            ><PlusIcon/> Invite Member</Button>
                        </div>
                    }
                    <div
                        className={cn(
                            `flex flex-wrap gap-4`
                        )}
                    >
                        {
                            selectedWorkspace?.workspace_members.map( member => (
                                <MemberCard
                                    data={member}
                                    key={member.user_id}
                                />
                            ) )
                        }
                    </div>
                </div>
                <MemberDialog/>
            </MembersSectionContenxt.Provider>
        </>
    )

}

export default Members_WorkspaceSettingsPage;

type TMemberCardProps = {
    data : TWorkspaceMember
}

const MemberCard : React.FC<TMemberCardProps> = ({
    data
}) => {

    const {
        setSelectedMember
    } = useContext(MembersSectionContenxt)

    return (
        <div
            className={cn(
                `flex gap-4 items-center`,
                `p-2 pr-4 bg-background border rounded-xl`,
                `cursor-pointer transition-all`,
                `hover:shadow-lg`
            )}
            onClick={() => {
                setSelectedMember(data)
            }}
        >
            <UserAvatar
                user_id_or_email={data.user_id}
                size="lg"
            />
            <div
                className={cn(
                    `flex flex-col`
                )}
            >
                <p className="text-sm font-medium" >{data.firstname} {data.lastname}</p>
                <p className="text-sm text-muted-foreground mb-1" >{data.email}</p>
                <WorkspaceMemberBadge
                    role={data.workspace_role}
                />
            </div>
        </div>
    )
}

const MemberDialog = () => {

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()

    const {
        selectedMember,
        setSelectedMember
    } = useContext(MembersSectionContenxt)

    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

    const [ role, setRole ] = useState<EWorkspaceRole | null>(null)

    const {
        mutate : updateWorkspaceMemberRoleTrigger,
        isPending : updateWorkspaceMemberRoleIsPending
    } = useUpdateWorkspaceMemberRole({
        onSuccess : () => {
            toast.success("Workspace member role updated successfully")
        }
    })

    const {
        data : workspaceMember,
        isLoading : workspaceMemberIsLoading
    } = useGetWorkspaceMember({
        params : {
            workspace_id : selectedWorkspace?.workspace_id,
            member_id : selectedMember?.user_id
        }
    })

    const handleSaveOnClick = () => {
        if ( workspaceMember ) {
            updateWorkspaceMemberRoleTrigger({
                params : {
                    workspace_id : workspaceMember.workspace_id,
                    member_id : workspaceMember.user_id
                },
                body : {
                    role : role as EWorkspaceRole
                }
            })
        }
    }

    useEffect(() => {
        if ( workspaceMember ) {
            setRole(workspaceMember.workspace_role)
        }
    }, [workspaceMember])

    return (
        <Dialog
            open={!!selectedMember}
            onOpenChange={open => {
                if ( !open ) {
                    setSelectedMember(null)
                }
            }}
        >
            <DialogContent>
                <div>
                    {
                        workspaceMemberIsLoading &&
                        <Spinner
                            size="xl"
                        />
                    }
                    {
                        (!workspaceMemberIsLoading && workspaceMember) &&
                        <div
                            className={cn(
                                `grid gap-4`
                            )}
                            style={{
                                gridTemplateColumns : "min-content 1fr"
                            }}
                        >
                            <UserAvatar
                                user_id_or_email={selectedMember?.user_id ?? ""}
                                size="xl"
                                disableHoverCard
                            />
                            <div
                                className={cn(
                                    `flex flex-col gap-2`
                                )}
                            >
                                <p className={` text-3xl font-medium `} >{workspaceMember?.firstname} {workspaceMember?.lastname}</p>
                                <p className={` text-sm text-muted-foreground `} >{workspaceMember?.email}</p>
                                <p><span className="text-sm text-muted-foreground" >Added on -</span> {workspaceMember?.joined_at ? dayjs(workspaceMember.joined_at).format("MMMM D, YYYY") : "N/A"}</p>
                                <p className="flex items-center gap-1" ><span className="text-sm text-muted-foreground" >Invited by -</span> {workspaceMember?.invited_by ? <UserAvatar user_id_or_email={workspaceMember.invited_by} size="sm" /> : "N/A"}</p>
                                {
                                    // Disable member role change of the selected member is an owner and the current user is not an admin or an owner
                                    (selectedMember?.workspace_role === EWorkspaceRole.OWNER) || (!isUserWorkspaceOwnerOrAdmin) ?
                                    <div className="mt-2" >
                                        <WorkspaceMemberBadge role={workspaceMember?.workspace_role ?? EWorkspaceRole.MEMBER} />
                                    </div>
                                    :
                                    <>
                                        <Label className="mt-[1rem]" htmlFor="workspace-role" >Workspace Role</Label>
                                        <Select
                                            value={role?.toString()}
                                            onValueChange={value => {
                                                setRole(Number(value) as EWorkspaceRole)
                                            }}
                                            disabled={updateWorkspaceMemberRoleIsPending}
                                        >
                                            <SelectTrigger id="workspace-role" className="w-full" >
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    Object.entries(EWorkspaceRole).filter( ([_, value]) => !isNaN(Number(value)) && value !== EWorkspaceRole.OWNER ).map( ([ key, value ]) => (
                                                        <SelectItem
                                                            key={key}
                                                            value={value.toString()}
                                                        >
                                                            {key}
                                                        </SelectItem>
                                                    ) )
                                                }
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant={"destructive"}
                                        ><AlertCircle/> Drop member from workspace</Button>
                                    </>
                                }
                            </div>
                        </div>
                    }
                </div>
                {
                    isUserWorkspaceOwnerOrAdmin &&
                    <DialogFooter>
                        <Button
                            onClick={handleSaveOnClick}
                            disabled={role === workspaceMember?.workspace_role}
                            isLoading={updateWorkspaceMemberRoleIsPending}
                        >Save</Button>
                    </DialogFooter>
                }
            </DialogContent>
        </Dialog>
    )

}