import { cn } from "@/lib/utils";
import TagsSection_ProjectSettingsPage from "../../../../components/others/project/tagsSection_projectSetttingsPage";
import { Separator } from "@/components/ui/separator";
import DangerZone_ProjectSettingsPage from "../../../../components/others/project/dangerZone_projectSettingsPage";
import Customization_ProjectSettingsPage from "@/components/others/project/customization_projectSettingsPage";
import Members_ProjectSettingsPage from "@/components/others/project/members_projectSettingsPage";
import useIsUserProjectOwnerOrAdmin from "@/lib/hooks/useIsUserProjectOwnerOrAdmin";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";
import { useGlobalsStore } from "@/stores/globals";
import { EWorkspaceRole } from "@repo/taskprio-types/src";
import { useEffect } from "react";


const ProjectSettingsPage = () => {

    const {
        workspaceRole
    } = useGlobalsStore()

    const isUserProjectOwnerOrAdmin = useIsUserProjectOwnerOrAdmin()
    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

    useEffect(() => {
        console.log(isUserProjectOwnerOrAdmin, isUserWorkspaceOwnerOrAdmin);
    }, [isUserProjectOwnerOrAdmin, isUserWorkspaceOwnerOrAdmin])

    return (
        <div
            className={cn(
                `size-full min-h-0 overflow-y-auto `
            )}
        >
            <div
                className={cn(
                    ` max-w-[80rem] min-w-[80rem] mx-auto `
                )}
            >
                <div
                    className={cn(
                        `h-fit flex flex-col space-y-16 `,
                        ` py-16 `
                    )}
                >
                    <h2 className={` text-2xl font-medium `} >Project Settings</h2>
                    <div
                        className={cn(
                            ` grid space-y-8 `
                        )}
                        style={{
                            gridTemplateColumns : ` 20rem 1fr `
                        }}
                    >
                        <TagsSection_ProjectSettingsPage/>
                        <Separator className=" col-span-full " />
                        {
                            (isUserProjectOwnerOrAdmin || isUserWorkspaceOwnerOrAdmin) &&
                            <>
                                <Customization_ProjectSettingsPage/>
                                <Separator className=" col-span-full " />
                            </>
                        }
                        <Members_ProjectSettingsPage/>
                        <Separator className=" col-span-full " />
                        {
                            workspaceRole === EWorkspaceRole.OWNER &&
                            <DangerZone_ProjectSettingsPage/>
                        }
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ProjectSettingsPage;