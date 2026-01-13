import TagBadge from "@/components/others/shared/tag/TagBadge";
import Spinner from "@/components/others/Spinner";
import { Button } from "@/components/ui/button";
import useIsUserProjectOwnerOrAdmin from "@/lib/hooks/useIsUserProjectOwnerOrAdmin";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";
import { cn } from "@/lib/utils";
import { useGetProjectTags } from "@/services/private/tag/query";
import { updateDialogsStore } from "@/stores/dialogs";
import { useProjectStore_selectedProject } from "@/stores/project";
import { Plus } from "lucide-react";

const TagsSection_ProjectSettingsPage = () => {

    const selectedProject = useProjectStore_selectedProject()

    const {
        data,
        isLoading
    } = useGetProjectTags(selectedProject?.project_id)

    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()
    const isUserProjectOwnerOrAdmin = useIsUserProjectOwnerOrAdmin()

    return (
        <>
            <div className="SettingsSectionHeader" >
                <h3 className={`SettingsSectionHeaderTitle`} >Tags</h3>
                <p className="SettingsSectionHeaderDescription" >
                    Tags are used to categorize tasks.
                </p>
            </div>
            <div
                className={cn(
                    `SettingsSectionContent`,
                )}
            >
                {
                    (isUserProjectOwnerOrAdmin || isUserWorkspaceOwnerOrAdmin) &&
                    <div
                        className={cn(
                            ` flex gap-4 `
                        )}
                    >
                        <Button
                            onClick={() => {
                                updateDialogsStore({
                                    tagDialog: {
                                        open: true,
                                        tag: null
                                    }
                                })
                            }}
                        ><Plus /> Create Tag</Button>
                    </div>
                }
                <div
                    className={cn(
                        ` flex flex-wrap gap-2 `
                    )}
                >
                    {
                        isLoading &&
                        <Spinner />
                    }
                    {
                        (!isLoading && data && data.length < 1) &&
                        <p className="font-semibold" >Project doesn't have any tags yet</p>
                    }
                    {
                        (!isLoading && data) &&
                        data.map(tag => (
                            <TagBadge
                                key={tag.tag_id}
                                tag={tag}
                                onClick={() => {
                                    if (isUserProjectOwnerOrAdmin || isUserWorkspaceOwnerOrAdmin) {
                                        updateDialogsStore({
                                            tagDialog: {
                                                open: true,
                                                tag
                                            }
                                        })
                                    }
                                }}
                            />
                        ))
                    }
                </div>
            </div>
        </>
    )

}

export default TagsSection_ProjectSettingsPage;