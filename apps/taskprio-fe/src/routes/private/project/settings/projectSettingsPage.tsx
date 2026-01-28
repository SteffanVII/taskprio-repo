import { cn } from "@/lib/utils";
import TagsSection_ProjectSettingsPage from "../../../../components/others/project/tagsSection_projectSetttingsPage";
import DangerZone_ProjectSettingsPage from "../../../../components/others/project/dangerZone_projectSettingsPage";
import Customization_ProjectSettingsPage from "@/components/others/project/customization_projectSettingsPage";
import Members_ProjectSettingsPage from "@/components/others/project/members_projectSettingsPage";
import useIsUserProjectOwnerOrAdmin from "@/lib/hooks/useIsUserProjectOwnerOrAdmin";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";
import { useWorkspaceStore_workspaceRole } from "@/stores/workspace";

import { EWorkspaceRole } from "@repo/taskprio-types";
import DeactivatedTaskboards_ProjectSettingsPage from "@/components/others/project/DeactivatedTaskboards_ProjectSettingsPage";

const ProjectSettingsPage = () => {

    const workspaceRole = useWorkspaceStore_workspaceRole()

    const isUserProjectOwnerOrAdmin = useIsUserProjectOwnerOrAdmin()
    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()

    return (
        <div
            className={cn(
                `SettingsBodyContainer`,
            )}
        >
            <div
                className={cn(
                    `SettingsBody`
                )}
            >
                <h2 className={` SettingsHeader `} >Project Settings</h2>
                <div
                    className={cn(
                        `SettingsSectionsContainer`
                    )}
                >
                    <TagsSection_ProjectSettingsPage />
                    {
                        (isUserProjectOwnerOrAdmin || isUserWorkspaceOwnerOrAdmin) &&
                        <>
                            <Customization_ProjectSettingsPage />
                            <DeactivatedTaskboards_ProjectSettingsPage />
                        </>
                    }
                    <Members_ProjectSettingsPage />
                    {
                        workspaceRole === EWorkspaceRole.OWNER &&
                        <DangerZone_ProjectSettingsPage />
                    }
                </div>
            </div>
        </div>
    )

}

export default ProjectSettingsPage;