import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDialogsStore, useDialogsStore_overlayModePreferencesDialog } from "@/stores/dialogs";
import ScreenSection_OverlaySettingsDialog from "./ScreenSection_OverlaySettingsDialog";
import LocationSection_OverlaySettingsDialog from "./LocationSection_OverlaySettingsDialog";

const OverlaySettingsDialog = () => {

  const { open } = useDialogsStore_overlayModePreferencesDialog()
  const setOverlayModePreferencesDialog = useDialogsStore(state => state.setOverlayModePreferencesDialog);

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        setOverlayModePreferencesDialog(open)
      }}
    >
      <DialogContent
        className={cn(
          `!w-[100dvw] !h-[100dvh] !max-w-screen rounded-none`,
          `flex flex-col items-start`
        )}
      >
        <DialogHeader>
          <DialogTitle className={`text-xl`} >Preferences</DialogTitle>
        </DialogHeader>
        <div
          className="size-full flex flex-col gap-4"
        >
          <ScreenSection_OverlaySettingsDialog />
          <LocationSection_OverlaySettingsDialog />
        </div>
      </DialogContent>
    </Dialog>
  )

}

export default OverlaySettingsDialog;