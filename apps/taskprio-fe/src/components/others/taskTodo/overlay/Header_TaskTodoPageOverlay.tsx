import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Home, Settings2 } from "lucide-react";
import { useContext } from "react";
import { StateManager_ElectronContext } from "@/stateManagers/StateManager_Electron";
import { updateDialogsStore } from "@/stores/dialogs";

const Header_TaskTodoPageOverlay = () => {

    const {
        switchToFullModeFromOverlayOrFocusMode
    } = useContext(StateManager_ElectronContext)

    const handleBackHome = () => {
        switchToFullModeFromOverlayOrFocusMode()
    }

    const handleOpenPreferencesDialog = () => {
        updateDialogsStore({
            overlayModePreferencesDialog: {
                open: true
            }
        })
    }

    return (
        <div
            className={cn(
                `flex justify-between `,
                ` p-4 pb-0 `
            )}
        >
            <div
                className={cn(
                    `flex gap-4`
                )}
            >
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                size={"icon-sm"}
                                variant={"ghost"}
                                onClick={handleOpenPreferencesDialog}
                            >
                                <Settings2 />
                            </Button>
                        }
                    />
                    <TooltipContent>Preferences</TooltipContent>
                </Tooltip>
            </div>
            <div
                className={cn(
                    `flex gap-2`
                )}
            >
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button
                                size={"icon-sm"}
                                variant={"ghost"}
                                onClick={handleBackHome}
                            >
                                <Home />
                            </Button>
                        }
                    />
                    <TooltipContent>Home</TooltipContent>
                </Tooltip>
            </div>
        </div>
    )

}

export default Header_TaskTodoPageOverlay;