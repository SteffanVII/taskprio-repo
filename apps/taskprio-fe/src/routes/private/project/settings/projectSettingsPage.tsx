import { cn } from "@/lib/utils";
import TagsSection_ProjectSettingsPage from "./tagsSection_projectSetttingsPage";
import { Separator } from "@/components/ui/separator";
import DangerZone_ProjectSettingsPage from "./dangerZone_projectSettingsPage";


const ProjectSettingsPage = () => {

    return (
        <div
            className={cn(
                ` max-w-[80rem] mx-auto `
            )}
        >
            <div
                className={cn(
                    ` flex flex-col space-y-16 `,
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
                    <DangerZone_ProjectSettingsPage/>
                </div>
            </div>
        </div>
    )

}

export default ProjectSettingsPage;