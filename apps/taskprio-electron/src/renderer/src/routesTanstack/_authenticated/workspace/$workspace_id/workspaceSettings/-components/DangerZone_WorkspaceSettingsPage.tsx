import { cn } from "@/lib/utils";


const DangerZone_WorkspaceSettingsPage = () => {

  return (
    <>
      <div className=" flex flex-col space-y-2 " >
        <h3 className={` text-lg text-destructive font-medium `} >Danger Zone</h3>
        <p className=" text-sm text-muted-foreground " >
          Deactivate or drop workspace
        </p>
      </div>
      <div
        className={cn(
          `p-4 border border-transparent rounded-md`,
          `hover:bg-secondary/50 hover:border-foreground/10`
        )}
      >

      </div>
    </>
  )

}

export default DangerZone_WorkspaceSettingsPage;