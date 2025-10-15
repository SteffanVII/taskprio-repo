import Members_WorkspaceSettingsPage from "@/components/others/workspace/members_workspaceSettingsPage";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const WorkspaceSettingsPage = () => {

    return (
        <div
            className={cn(
                `size-full min-h-0 overflow-y-auto `
            )}
        >
            <div
                className={cn(
                    `max-w-[80rem] min-w-[80rem] mx-auto`
                )}
            >
                <div
                    className={cn(
                        ` flex flex-col space-y-16 `,
                        ` py-16 `
                    )}
                >
                    <h2 className={` text-2xl font-medium `} >Workspace Settings</h2>
                    <div
                        className={cn(
                            ` grid space-y-8 `
                        )}
                        style={{
                            gridTemplateColumns : ` 20rem 1fr `
                        }}
                    >
                        <Members_WorkspaceSettingsPage/>
                        <Separator className=" col-span-full " />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default WorkspaceSettingsPage;