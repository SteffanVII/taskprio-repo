import TagBadge from "@/components/others/shared/tag/TagBadge";
import Spinner from "@/components/others/Spinner";
import { Button } from "@/components/ui/button";
import useIsUserProjectOwnerOrAdmin from "@/lib/hooks/useIsUserProjectOwnerOrAdmin";
import useIsUserWorkspaceOwnerOrAdmin from "@/lib/hooks/useIsUserWorkspaceOwnerOrAdmin";
import { cn } from "@/lib/utils";
import { useGetProjectTags } from "@/services/private/tag/query";
import { updateDialogsStore } from "@/stores/dialogs";
import { useGlobalsStore_selectedProject } from "@/stores/globals";

const TagsSection_ProjectSettingsPage = () => {

    const selectedProject = useGlobalsStore_selectedProject()

    const {
        data,
        isLoading
    } = useGetProjectTags( selectedProject?.project_id )

    const isUserWorkspaceOwnerOrAdmin = useIsUserWorkspaceOwnerOrAdmin()
    const isUserProjectOwnerOrAdmin = useIsUserProjectOwnerOrAdmin()

    return (
        <>
            <div className=" flex flex-col space-y-2 " >
                <h3 className={` text-lg font-medium `} >Tags</h3>
                <p className=" text-sm text-muted-foreground " >
                    Tags are used to categorize tasks.
                </p>
            </div>
            <div
                className={cn(
                    ` flex flex-col gap-8 `,
                    `p-4 border border-transparent rounded-md`,
                    `hover:bg-secondary/50 hover:border-foreground/10`,
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
                                onClick={ () => {
                                    updateDialogsStore({
                                        tagDialog : {
                                            open : true,
                                            tag : null
                                        }
                                    })
                                } }
                                className={cn(
                                    ` size-fit `
                                )}
                            >Create Tag</Button>
                        </div>
                    }
                <div
                    className={cn(
                        ` flex flex-wrap gap-2 `
                    )}
                >
                    {
                        isLoading && 
                        <Spinner/>
                    }
                    {
                        (!isLoading && data && data.length < 1) &&
                        <p className="font-semibold" >Project doesn't have any tags yet</p>
                    }
                    {
                        (!isLoading && data) &&
                        data.map( tag => (
                            <TagBadge
                                key={tag.tag_id}
                                tag={tag}
                                onClick={() => {
                                    if ( isUserProjectOwnerOrAdmin || isUserWorkspaceOwnerOrAdmin ) {
                                        updateDialogsStore({
                                            tagDialog : {
                                                open : true,
                                                tag
                                            }
                                        })
                                    }
                                }}
                            />
                        ) )
                    }
                </div>
            </div>
        </>
    )

}

export default TagsSection_ProjectSettingsPage;