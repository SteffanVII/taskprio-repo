import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { StateManager_ElectronContext } from "@/stateManagers/StateManager_Electron";
import { useElectronStore_preferences } from "@/stores/electron";
import { TElectronStorePreferencesOverlayLocation } from "@repo/taskprio-types/src";
import { useContext } from "react";

const LocationSection_OverlaySettingsDialog = () => {

    const preferences = useElectronStore_preferences()
    const { switchOverlayLocation } = useContext(StateManager_ElectronContext)

    return (
        <div
            className={cn(
                `flex flex-col justify-center gap-4`,
            )}
        >
            <Label>Location</Label>
            <div className="w-full h-fit flex items-center justify-center" >
                <RadioGroup
                    className={cn(
                        `w-[24rem] h-[16rem] max-w-full`,
                        `grid gap-0`,
                        `border rounded-lg`
                    )}
                    style={{
                        gridTemplateColumns : `repeat(2, 1fr)`,
                        gridTemplateRows : `repeat(2, 1fr)`
                    }}
                    value={preferences?.overlay?.location}
                    onValueChange={ ( value ) => {
                        switchOverlayLocation(value as TElectronStorePreferencesOverlayLocation)
                    } }
                >
                    <Label
                        className="relative flex justify-start items-start p-4 border-r border-b"
                    >
                        {
                            preferences?.overlay?.location === "top-left" &&
                            <div
                                className={cn(
                                    `absolute top-2 left-2 w-[3rem] h-[calc(100%-1rem)]`,
                                    `bg-muted rounded`
                                )}
                            ></div>
                        }
                        <RadioGroupItem value="top-left"/>
                    </Label>
                    <Label
                        className="relative flex justify-end items-start p-4 border-b"
                    >
                        {
                            preferences?.overlay?.location === "top-right" &&
                            <div
                                className={cn(
                                    `absolute top-2 right-2 w-[3rem] h-[calc(100%-1rem)]`,
                                    `bg-muted rounded`
                                )}
                            ></div>
                        }
                        <RadioGroupItem value="top-right"/>
                    </Label>
                    <Label
                        className="relative flex justify-start items-end p-4 border-r"
                    >
                        {
                            preferences?.overlay?.location === "bottom-left" &&
                            <div
                                className={cn(
                                    `absolute bottom-2 left-2 w-[3rem] h-[calc(100%-1rem)]`,
                                    `bg-muted rounded`
                                )}
                            ></div>
                        }
                        <RadioGroupItem value="bottom-left"/>
                    </Label>
                    <Label
                        className="relative flex justify-end items-end p-4"
                    >
                        {
                            preferences?.overlay?.location === "bottom-right" &&
                            <div
                                className={cn(
                                    `absolute bottom-2 right-2 w-[3rem] h-[calc(100%-1rem)]`,
                                    `bg-muted rounded`
                                )}
                            ></div>
                        }
                        <RadioGroupItem value="bottom-right"/>
                    </Label>
                </RadioGroup>
            </div>
        </div>
    )

}

export default LocationSection_OverlaySettingsDialog;