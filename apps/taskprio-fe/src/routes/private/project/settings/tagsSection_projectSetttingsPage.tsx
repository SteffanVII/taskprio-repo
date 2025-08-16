import Spinner from "@/components/others/Spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import getHexLuminance from "@/lib/utils/hexColorLuminance";
import { useGetProjectTags } from "@/services/private/tag/query";
import { updateDialogsStore } from "@/stores/dialogs";
import { useGlobalsStore } from "@/stores/globals";

const TagsSection_ProjectSettingsPage = () => {

    const {
        selectedProject
    } = useGlobalsStore()

    const {
        data,
        isLoading
    } = useGetProjectTags( selectedProject?.project_id )

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
                    ` p-4`,
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
                        (!isLoading && data) &&
                        data.map( tag => (
                            <Badge
                                key={tag.tag_id}
                                className={cn(
                                    ` size-fit `
                                )}
                                style={{
                                    backgroundColor : tag.tag_color,
                                    color : getHexLuminance(tag.tag_color) > 0.5 ? "black" : "white"
                                }}
                                onClick={() => {
                                    updateDialogsStore({
                                        tagDialog : {
                                            open : true,
                                            tag
                                        }
                                    })
                                }}
                            >{ tag.tag_name }</Badge>
                        ) )
                    }
                </div>
            </div>
        </>
    )

}

export default TagsSection_ProjectSettingsPage;