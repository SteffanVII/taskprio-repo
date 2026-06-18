import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useElectronStore, useElectronStore_displays, useElectronStore_preferences } from "@/stores/electron";

const ScreenSection_OverlaySettingsDialog = () => {

  const displays = useElectronStore_displays()
  const preferences = useElectronStore_preferences()
  const setPreferences = useElectronStore(state => state.setPreferences)

  const handleScreenChange = (screenId: number) => {
    if (!!window.electronAPI) {
      window.electronAPI.changeOverlayScreen(screenId)
      setPreferences({
        overlay: {
          ...preferences?.overlay,
          screen: {
            ...preferences?.overlay?.screen,
            id: screenId
          }
        }
      })
    }
  }

  if (displays.length < 2) return null;

  return (
    <div
      className={cn(
        `flex flex-col justify-center gap-4`,
      )}
    >
      <div className="flex flex-col gap-2" >
        <Label>Screen</Label>
        <p className="text-[0.8rem] text-muted-foreground" >Choose which screen you want the overlay to appear.</p>
      </div>
      <RadioGroup
        value={preferences?.overlay?.screen?.id}
        className={cn(
          `flex justify-center items-end gap-4 p-4`
        )}
        onValueChange={value => handleScreenChange(value as number)}
      >
        {
          displays.map(display => (
            <Label
              className={cn(
                `flex flex-col p-0`,
                `size-fit bg-card border rounded-md`
              )}
            >
              <div
                className={cn(
                  [0, 180].includes(display.orientation) ? `w-[9rem] h-[5rem]` : `w-[5rem] !h-[7rem]`
                )}
              ></div>
              <div className="w-full flex gap-4 p-4 border-t" >
                <RadioGroupItem value={display.id} /> <p>{display.name}</p>
              </div>
            </Label>
          ))
        }
      </RadioGroup>
    </div>
  )

}

export default ScreenSection_OverlaySettingsDialog;