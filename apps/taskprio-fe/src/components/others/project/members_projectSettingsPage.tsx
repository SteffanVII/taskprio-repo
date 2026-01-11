import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetProjectMember, useGetProjectMembers } from "@/services/private/project/query";
import { EProjectRole, TProjectMember, TWorkspaceMember } from "@repo/taskprio-types/src";
import React, { createContext, useContext, useMemo, useState } from "react";
import { useParams } from "react-router";
import UserAvatar from "../shared/UserAvatar";
import WorkspaceMemberBadge from "../shared/WorkspaceMemberBadge";
import ProjectMemberBadge from "../shared/ProjectMemberBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGlobalsStore_selectedProject, useGlobalsStore_selectedWorkspace } from "@/stores/globals";
import { AlertCircle, PlusIcon, SaveIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddMembersToProject, useDeactivateProjectMember, useReactivateProjectMember } from "@/services/private/project/mutation";
import { toast } from "sonner";
import Spinner from "../Spinner";
import dayjs from "@/lib/dayjs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateProjectMemberRole } from "@/services/private/profile/mutation";
import useIsUserProjectOwnerOrAdmin from "@/lib/hooks/useIsUserProjectOwnerOrAdmin";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";

type TMembersSectionContext = {
    selectedMember: TProjectMember | null,
    setSelectedMember: (member: TProjectMember | null) => void
}

const MembersSectionContenxt = createContext<TMembersSectionContext>({
    selectedMember: null,
    setSelectedMember: () => { }
})

const Members_ProjectSettingsPage = () => {

    const {
        project_id
    } = useParams()

    const {
        data: projectMembers
    } = useGetProjectMembers(project_id)

    const isUserProjectOwnerOrAdmin = useIsUserProjectOwnerOrAdmin()
    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

    const [selectedMember, setSelectedMember] = useState<TProjectMember | null>(null)

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
                        Manage the project members.
                    </p>
                </div>
                <div
                    className={cn(
                        `SettingsSectionContent`
                    )}
                >
                    {
                        (isUserProjectOwnerOrAdmin || isUserWorkspaceOwnerOrAdmin) &&
                        <div
                            className="flex gap-4"
                        >
                            <AddProjectMemberDialog
                                members={projectMembers || []}
                            />
                        </div>
                    }
                    <div
                        className={cn(
                            `flex gap-4 flex-wrap`
                        )}
                    >
                        {
                            projectMembers?.map(member => (
                                <MemberCard
                                    key={member.user_id}
                                    data={member}
                                />
                            ))
                        }
                    </div>
                </div>
                <MemberDialog />
            </MembersSectionContenxt.Provider>
        </>
    )

}

export default Members_ProjectSettingsPage;

type TMemberCardProps = {
    data: TProjectMember
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
                <ProjectMemberBadge
                    role={data.project_role}
                />
            </div>
        </div>
    )

}

type TAddProjectMemberDialogProps = {
    members: TProjectMember[]
}

type TSelectedMember = {
    user_id: string,
    role: EProjectRole
}

const AddProjectMemberDialog: React.FC<TAddProjectMemberDialogProps> = ({
    members
}) => {

    const selectedWorkspace = useGlobalsStore_selectedWorkspace()
    const selectedProject = useGlobalsStore_selectedProject()

    const [selectedMembers, setSelectedMembers] = useState<TSelectedMember[]>([])

    const {
        mutate: addMembersToProjectTrigger,
        isPending: addMembersToProjectIsPending
    } = useAddMembersToProject({
        onSuccess: () => {
            toast.success("Members added to project successfully")
        }
    })

    const availableMembers = useMemo(() => {

        if (!selectedWorkspace || !selectedWorkspace?.workspace_members) return []

        const returnValue = selectedWorkspace?.workspace_members.filter(member => {
            const foundMember = members.find(m => m.user_id === member.user_id)
            return !foundMember
        })

        return returnValue

    }, [members, selectedWorkspace])

    const addToSelectedMembersHandler = (id: string, role: EProjectRole) => {
        if (selectedMembers.some(m => m.user_id === id)) {
            setSelectedMembers(selectedMembers.filter(m => m.user_id !== id))
        } else {
            setSelectedMembers([...selectedMembers, { user_id: id, role }])
        }
    }

    const addMembersHandler = () => {
        addMembersToProjectTrigger({
            params: {
                project_id: selectedProject!.project_id!
            },
            body: {
                members: selectedMembers
            }

        })
    }

    return (
        <Dialog>
            <DialogTrigger
                render={
                    <Button className="w-fit" ><PlusIcon />Add Member</Button>
                }
            />
            <DialogContent
                className={cn(
                    `!max-w-[46rem]`
                )}
            >
                <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>
                    <DialogDescription>Add a new member to the project.</DialogDescription>
                </DialogHeader>
                <ScrollArea
                    className={cn(
                        `max-h-[40rem]`
                    )}
                >
                    <div
                        className={cn(
                            `flex flex-wrap gap-2 p-4 py-8`
                        )}
                    >
                        {
                            availableMembers?.length === 0 &&
                            <p className="text-sm text-muted-foreground font-bold" >No available members</p>
                        }
                        {
                            availableMembers?.map(member => (
                                <AvailableMemberCard
                                    key={member.user_id}
                                    data={member}
                                    selected={selectedMembers.some(m => m.user_id === member.user_id)}
                                    addToSelectedMembers={addToSelectedMembersHandler}
                                />
                            ))
                        }
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button
                        disabled={selectedMembers.length === 0 || addMembersToProjectIsPending}
                        onClick={() => {
                            addMembersHandler()
                        }}
                    >
                        {
                            addMembersToProjectIsPending ? <Spinner /> : "Add"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

type TAvailableMemberCardProps = {
    data: TWorkspaceMember,
    selected: boolean,
    addToSelectedMembers: (id: string, role: EProjectRole) => void
}

const AvailableMemberCard: React.FC<TAvailableMemberCardProps> = ({
    data,
    selected,
    addToSelectedMembers
}) => {

    return (
        <div
            className={cn(
                `relative flex gap-4 items-center`,
                `p-2 pr-4 bg-background border rounded-xl`,
                `cursor-pointer transition-all`,
                `hover:shadow-lg`
            )}
            onClick={() => addToSelectedMembers(data.user_id, EProjectRole.MEMBER)}
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
            <Checkbox
                checked={selected}
                className="absolute top-2 right-2 pointer-events-none"
            />
        </div>
    )

}



const MemberDialog = () => {

    const {
        selectedMember,
        setSelectedMember
    } = useContext(MembersSectionContenxt)

    const {
        data: projectMember,
        isLoading: projectMemberIsLoading
    } = useGetProjectMember({
        params: {
            project_id: selectedMember?.project_id,
            member_id: selectedMember?.user_id
        }
    })

    const {
        mutate: updateProjectMemberRoleTrigger,
        isPending: updateProjectMemberRoleIsPending
    } = useUpdateProjectMemberRole({
        onSuccess: () => {
            toast.success("Project member role updated successfully")
        }
    })

    const {
        mutate : deactivateProjectMemberTrigger,
        isPending : deactivateProjectMemberIsPending
    } = useDeactivateProjectMember({
        onSuccess : () => {
            toast.success("Project member deactivated successfully")
        }
    })

    const {
        mutate : reactivateProjectMemberTrigger,
        isPending : reactivateProjectMemberIsPending
    } = useReactivateProjectMember({
        onSuccess : () => {
            toast.success("Project member reactivated successfully")
        }
    })

    const isUserProjectOwnerOrAdmin = useIsUserProjectOwnerOrAdmin()
    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

    const [role, setRole] = useState<EProjectRole>(projectMember?.project_role ?? EProjectRole.MEMBER)

    const showSaveButton = useMemo(() => {
        return ((isUserProjectOwnerOrAdmin || isUserWorkspaceOwnerOrAdmin) && projectMember?.project_role !== EProjectRole.OWNER && !projectMemberIsLoading)
    }, [isUserProjectOwnerOrAdmin, isUserWorkspaceOwnerOrAdmin, projectMember, projectMemberIsLoading])

    const handleSaveOnClick = () => {
        if (selectedMember && projectMember) {
            updateProjectMemberRoleTrigger({
                params: {
                    project_id: projectMember.project_id,
                    member_id: projectMember.user_id
                },
                body: {
                    role: role as EProjectRole
                }
            })
        }
    }

    const handleDeactivateMember = () => {
        if (selectedMember && projectMember) {
            deactivateProjectMemberTrigger({
                project_id : selectedMember.project_id,
                member_id : selectedMember.user_id
            })
        }
    }

    const handleReactivateMember = () => {
        if (selectedMember && projectMember) {
            reactivateProjectMemberTrigger({
                project_id : selectedMember.project_id,
                member_id : selectedMember.user_id
            })
        }
    }

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
                        projectMemberIsLoading &&
                        <Spinner size="xl" />
                    }
                    {
                        (!projectMemberIsLoading && projectMember) &&
                        <div
                            className={cn(
                                ` flex flex-col gap-2`
                            )}
                        >
                            <UserAvatar
                                user_id_or_email={selectedMember?.user_id ?? ""}
                                size="lg"
                                disableHoverCard
                            />
                            <p className={` text-3xl font-medium mt-4 `} >{projectMember?.firstname} {projectMember?.lastname}</p>
                            <p className={` text-sm text-muted-foreground `} >{projectMember?.email}</p>
                            <p><span className="text-sm text-muted-foreground" >Added on -</span> {projectMember?.joined_at ? dayjs(projectMember.joined_at).format("MMMM D, YYYY") : "N/A"}</p>
                            <p className="flex items-center gap-1" ><span className="text-sm text-muted-foreground" >Invited by -</span> {projectMember?.invited_by ? <UserAvatar user_id_or_email={projectMember.invited_by} size="sm" /> : "N/A"}</p>
                            {
                                projectMember?.project_role === EProjectRole.OWNER || (!isUserProjectOwnerOrAdmin && !isUserWorkspaceOwnerOrAdmin) ?
                                    <div
                                        className="mt-2"
                                    >
                                        <ProjectMemberBadge role={projectMember?.project_role ?? EProjectRole.MEMBER} />
                                    </div>
                                    :
                                    <>
                                        <Label className="mt-[1rem]" htmlFor="workspace-role" >Workspace Role</Label>
                                        <Select
                                            items={Object.entries(EProjectRole).map(([key, value]) => ({
                                                value: value.toString(),
                                                label: key.toLowerCase()
                                            }))}
                                            value={role?.toString()}
                                            onValueChange={value => {
                                                setRole(Number(value) as EProjectRole)
                                            }}
                                            disabled={updateProjectMemberRoleIsPending || !selectedMember?.is_active}
                                        >
                                            <SelectTrigger id="workspace-role" className="w-full" >
                                                <SelectValue className={`capitalize`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    Object.entries(EProjectRole).filter(([_, value]) => !isNaN(Number(value)) && value !== EProjectRole.OWNER).map(([key, value]) => (
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
                                            variant={ selectedMember?.is_active ? "destructive" : "secondary"}
                                            disabled={updateProjectMemberRoleIsPending || deactivateProjectMemberIsPending || reactivateProjectMemberIsPending}
                                            onClick={() => {
                                                if (selectedMember?.is_active) {
                                                    handleDeactivateMember()
                                                } else {
                                                    handleReactivateMember()
                                                }
                                            }}
                                        >
                                            {
                                                (deactivateProjectMemberIsPending || reactivateProjectMemberIsPending) ? <Spinner /> :
                                                <>
                                                    <AlertCircle />
                                                    {
                                                        selectedMember?.is_active ? "Deactivate member from project" : "Reactivate member from project"
                                                    }
                                                </>
                                            }
                                        </Button>
                                    </>
                            }
                        </div>
                    }
                </div>
                <DialogFooter>
                    {
                        showSaveButton &&
                        <Button
                            variant={"secondary"}
                            onClick={handleSaveOnClick}
                            disabled={role === projectMember?.project_role || updateProjectMemberRoleIsPending || deactivateProjectMemberIsPending || reactivateProjectMemberIsPending}
                        >
                            {
                                updateProjectMemberRoleIsPending ? <Spinner /> : <><SaveIcon />Save</>
                            }
                        </Button>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}