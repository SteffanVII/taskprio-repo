import { useGlobalsStore_authenticated, useGlobalsStore_authenticateIsPending, useGlobalsStore_logoutIsPending } from "@/stores/globals";
import Spinner from "./Spinner";
import { LockKeyhole, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useContext, useMemo } from "react";
import { EWebsocketConnectionState, WebSocketContext } from "./websocket/WebsocketProvider";

type TLoaderScreenProps = {
    render : React.ReactNode
}

const LoaderScreen : React.FC<TLoaderScreenProps> = ({ render }) => {

    const {
        connectionState: webSocketConnectionState,
        initialConnection: webSocketInitialConnection
    } = useContext(WebSocketContext)

    const authenticated = useGlobalsStore_authenticated()
    const authenticateIsPending = useGlobalsStore_authenticateIsPending()
    const logoutIsPending = useGlobalsStore_logoutIsPending()

    const showLoadingScreen = useMemo(() => {
        return ((!authenticated || authenticateIsPending || (webSocketConnectionState !== EWebsocketConnectionState.OPEN && webSocketInitialConnection)) && !logoutIsPending);
    }, [
        authenticated,
        webSocketConnectionState,
        authenticateIsPending,
        logoutIsPending
    ])

    if ( !showLoadingScreen ) return render;

    return (
        <div
            className={cn(
                `fixed top-0 left-0 w-screen h-screen`,
                ` size-full max-w-screen max-h-screen `,
                ` flex flex-col gap-[4rem] items-center justify-center `,
                ` bg-background z-[49] `
            )}
        >
            <div className="flex gap-[4rem]" >
                <div className="relative flex gap-4 items-center" >
                    {
                        authenticateIsPending &&
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" >
                            <Spinner size="7xl" />
                        </div>
                    }
                    <LockKeyhole
                        className={cn(
                            `size-[2rem]`,
                            authenticated && `text-green-400`
                        )}
                    />
                </div>
                <div className="relative flex flex-col gap-4 items-center" >
                    {
                        webSocketConnectionState !== EWebsocketConnectionState.OPEN &&
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" >
                            <Spinner size="7xl" />
                        </div>
                    }
                    <Rocket
                        className={cn(
                            `size-[2rem]`,
                            webSocketConnectionState === EWebsocketConnectionState.OPEN && `text-green-400`
                        )}
                    />
                </div>
            </div>
        </div>
    )
    
}

export default LoaderScreen;