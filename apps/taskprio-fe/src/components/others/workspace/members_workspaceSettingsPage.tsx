import { cn } from "@/lib/utils";
import { EWorkspaceRole, TWorkspaceMember } from "@repo/taskprio-types/src";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import UserAvatar from "../shared/UserAvatar";
import WorkspaceMemberBadge from "../shared/WorkspaceMemberBadge";
import { useWorkspaceStore_selectedWorkspace } from "@/stores/workspace";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlusIcon } from "lucide-react";
import { updateDialogsStore } from "@/stores/dialogs";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dayjs from "dayjs";
import { Label } from "@/components/ui/label";
import { useDeactivateWorkspaceMember, useReactivateWorkspaceMember, useUpdateWorkspaceMemberRole } from "@/services/private/workspace/mutation";
import { toast } from "sonner";
import { useGetWorkspaceMember } from "@/services/private/workspace/query";
import Spinner from "../Spinner";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type TMembersSectionContext = {
    selectedMember: TWorkspaceMember | null
    setSelectedMember: (member: TWorkspaceMember | null) => void
}

const MembersSectionContenxt = createContext<TMembersSectionContext>({
    selectedMember: null,
    setSelectedMember: () => { }
})

export const Members_WorkspaceSettingsPage = () => {

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

    const [selectedMember, setSelectedMember] = useState<TWorkspaceMember | null>(null)
    const [showDeactivatedMembers, setShowDeactivatedMembers] = useState<boolean>(false)

    const activeMembers = useMemo(() => {
        return (selectedWorkspace?.workspace_members || []).filter(member => member.is_active)
    }, [selectedWorkspace])

    const deactivatedMembers = useMemo(() => {
        return (selectedWorkspace?.workspace_members || []).filter(member => !member.is_active)
    }, [selectedWorkspace])

    const handleInviteMemberOnClick = () => {
        updateDialogsStore({
            workspaceInvitationDialog: {
                open: true
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
                <div className="SettingsSectionHeader" >
                    <h3 className={`SettingsSectionHeaderTitle`} >Members</h3>
                    <p className="SettingsSectionHeaderDescription" >
                        Manage the workspace members
                    </p>
                </div>
                <div
                    className={cn(
                        `SettingsSectionContent`
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
                            ><PlusIcon /> Invite Member</Button>
                        </div>
                    }
                    <div className="flex flex-col gap-8" >
                        <div
                            className={cn(
                                `flex flex-wrap gap-4`
                            )}
                        >
                            {
                                activeMembers.map(member => (
                                    <MemberCard
                                        data={member}
                                        key={member.user_id}
                                    />
                                ))
                            }
                        </div>
                        <div className="flex items-center gap-4" >
                            <Badge variant={"outline"} className="flex items-center gap-2 h-fit py-2 px-3" >
                                <Switch
                                    id="show-deactivated"
                                    checked={showDeactivatedMembers}
                                    onCheckedChange={setShowDeactivatedMembers}
                                />
                                <Label htmlFor="show-deactivated" className=" text-muted-foreground text-nowrap " >Show deactivated {deactivatedMembers?.length}</Label>
                            </Badge>
                            <Separator className="flex-1" />
                        </div>
                        {
                            showDeactivatedMembers &&
                            <div
                                className={cn(
                                    `flex flex-wrap gap-4`
                                )}
                            >
                                {
                                    deactivatedMembers.length > 0 ?
                                    deactivatedMembers.map(member => (
                                        <MemberCard
                                            data={member}
                                            key={member.user_id}
                                        />
                                    ))
                                    :
                                    <p className="w-full text-center text-muted-foreground my-4" >No deactivated members</p>
                                }
                            </div>
                        }

                    </div>
                </div>
                <MemberDialog />
            </MembersSectionContenxt.Provider>
        </>
    )

}

export default Members_WorkspaceSettingsPage;

type TMemberCardProps = {
    data: TWorkspaceMember
}

const MemberCard: React.FC<TMemberCardProps> = ({
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
                `hover:shadow-lg`,
                data.is_active === false && `bg-destructive/10 border-destructive/20`
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
                <div className="flex gap-2 items-center" >
                    <WorkspaceMemberBadge
                        role={data.workspace_role}
                    />
                    {
                        data.is_active === false &&
                        <p className="text-sm text-destructive" >Deactivated</p>
                    }
                </div>
            </div>
        </div>
    )
}

const MemberDialog = () => {

    const selectedWorkspace = useWorkspaceStore_selectedWorkspace()

    const {
        selectedMember,
        setSelectedMember
    } = useContext(MembersSectionContenxt)

    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

    const [role, setRole] = useState<EWorkspaceRole | null>(null)

    const {
        mutate: updateWorkspaceMemberRoleTrigger,
        isPending: updateWorkspaceMemberRoleIsPending
    } = useUpdateWorkspaceMemberRole({
        onSuccess: () => {
            toast.success("Workspace member role updated successfully")
        }
    })

    const {
        mutate: deactivateWorkspaceMemberTrigger,
        isPending: deactivateWorkspaceMemberIsPending
    } = useDeactivateWorkspaceMember()

    const {
        mutate: reactivateWorkspaceMemberTrigger,
        isPending: reactivateWorkspaceMemberIsPending
    } = useReactivateWorkspaceMember()

    const {
        data: workspaceMember,
        isLoading: workspaceMemberIsLoading
    } = useGetWorkspaceMember({
        params: {
            workspace_id: selectedWorkspace?.workspace_id,
            member_id: selectedMember?.user_id
        }
    })

    const handleSaveOnClick = () => {
        if (workspaceMember) {
            updateWorkspaceMemberRoleTrigger({
                params: {
                    workspace_id: workspaceMember.workspace_id,
                    member_id: workspaceMember.user_id
                },
                body: {
                    role: role as EWorkspaceRole
                }
            })
        }
    }

    useEffect(() => {
        if (workspaceMember) {
            setRole(workspaceMember.workspace_role)
        }
    }, [workspaceMember])

    return (
        <Dialog
            open={!!selectedMember}
            onOpenChange={open => {
                if (!open) {
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
                                `flex flex-col gap-2`
                            )}
                        >
                            <UserAvatar
                                user_id_or_email={selectedMember?.user_id ?? ""}
                                size="lg"
                                disableHoverCard
                            />
                            <p className={` text-3xl font-medium mt-4 `} >{workspaceMember?.firstname} {workspaceMember?.lastname}</p>
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
                                            items={Object.entries(EWorkspaceRole).map(([key, value]) => ({
                                                value: value.toString(),
                                                label: key.toLowerCase()
                                            }))}
                                            value={role?.toString()}
                                            onValueChange={value => {
                                                setRole(Number(value) as EWorkspaceRole)
                                            }}
                                            disabled={updateWorkspaceMemberRoleIsPending}
                                        >
                                            <SelectTrigger id="workspace-role" className="w-full" >
                                                <SelectValue className={`capitalize`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    Object.entries(EWorkspaceRole).filter(([_, value]) => !isNaN(Number(value)) && value !== EWorkspaceRole.OWNER).map(([key, value]) => (
                                                        <SelectItem
                                                            key={key}
                                                            value={value.toString()}
                                                            className={`capitalize`}
                                                        >
                                                            {key.toLowerCase()}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant={workspaceMember?.is_active ? "destructive" : "secondary"}
                                            disabled={updateWorkspaceMemberRoleIsPending || deactivateWorkspaceMemberIsPending || reactivateWorkspaceMemberIsPending}
                                            onClick={() => {
                                                if (workspaceMember?.is_active) {
                                                    deactivateWorkspaceMemberTrigger({
                                                        workspace_id : workspaceMember.workspace_id,
                                                        member_id : workspaceMember.user_id
                                                    })
                                                } else {
                                                    reactivateWorkspaceMemberTrigger({
                                                        workspace_id : workspaceMember.workspace_id,
                                                        member_id : workspaceMember.user_id
                                                    })
                                                }
                                            }}
                                        >
                                            {
                                                (deactivateWorkspaceMemberIsPending || reactivateWorkspaceMemberIsPending) ? <Spinner /> :
                                                    <>
                                                        <AlertCircle />
                                                        {
                                                            workspaceMember?.is_active ? "Deactivate member from workspace" : "Reactivate member from workspace"
                                                        }
                                                    </>
                                            }
                                        </Button>
                                    </>
                            }
                        </div>
                    }
                </div>
                {
                    isUserWorkspaceOwnerOrAdmin &&
                    <DialogFooter>
                        <Button
                            onClick={handleSaveOnClick}
                            disabled={role === workspaceMember?.workspace_role || updateWorkspaceMemberRoleIsPending}
                        >
                            {updateWorkspaceMemberRoleIsPending ? <Spinner /> : "Save"}
                        </Button>
                    </DialogFooter>
                }
            </DialogContent>
        </Dialog>
    )

}