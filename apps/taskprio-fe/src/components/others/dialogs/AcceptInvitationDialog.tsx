import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGetInvitationInfo } from "@/services/public/invitation/query"
import { updateDialogsStore, useDialogsStore_acceptInvitationDialog } from "@/stores/dialogs"
import Spinner from "../Spinner"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAcceptInvitation } from "@/services/private/invitation/mutation"

const AcceptInvitationDialog = () => {

    const { open, token } = useDialogsStore_acceptInvitationDialog()

    const {
        data: invitationInfo,
        isLoading: getInvitationInfoIsLoading,
        isError: getInvitationInfoIsError,
        error: getInvitationInfoError
    } = useGetInvitationInfo(token)

    const {
        mutateAsync: acceptInvitation,
        isPending: isAcceptInvitationPending,
        error: acceptInvitationError,
    } = useAcceptInvitation(() => {
        updateDialogsStore({
            acceptInvitationDialog: {
                open: false,
                token: null
            }
        })
    })


    const handleAcceptInvitation = () => {
        if (token) {
            acceptInvitation(token)
        }
    }


    const content = () => {
        if (getInvitationInfoIsLoading) {
            return <Spinner />
        }
        if (getInvitationInfoIsError) {
            return <p className="text-destructive" >Error: {getInvitationInfoError.message}</p>
        }
        if (!getInvitationInfoIsLoading && !getInvitationInfoIsError && invitationInfo) {
            return (
                <>
                    <div
                        className={cn(
                            `flex flex-col`
                        )}
                    >
                        <div className="flex flex-col p-2 px-3 rounded-t-md border bg-card" >
                            <p className="text-muted-foreground text-sm" >Workspace</p>
                            <p className="text-lg font-bold" >{invitationInfo.workspace_name}</p>
                        </div>
                        <div className="flex flex-col p-2 px-3 rounded-b-md border-x border-b bg-card" >
                            <p className="text-muted-foreground text-sm" >Sent by</p>
                            <p className="text-lg font-bold" >{invitationInfo.sender_firstname} {invitationInfo.sender_lastname}</p>
                        </div>
                        {
                            invitationInfo.accepted &&
                            <Card className="w-full" >
                                <p className="text-destructive text-center" >You have already accepted this invitation</p>
                            </Card>
                        }
                        {
                            (acceptInvitationError && !isAcceptInvitationPending) &&
                            <Card className="w-full" >
                                <p className="text-destructive text-center" >Error: {acceptInvitationError.message}</p>
                            </Card>
                        }
                    </div>
                    {
                        !invitationInfo.accepted &&
                        <DialogFooter>
                            <Button variant={"outline"} >Decline</Button>
                            <Button
                                onClick={handleAcceptInvitation}
                            >
                                {
                                    isAcceptInvitationPending ?
                                        <Spinner />
                                        :
                                        "Accept"
                                }
                            </Button>
                        </DialogFooter>
                    }
                </>
            )

        }

    }

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                updateDialogsStore({
                    acceptInvitationDialog: {
                        open,
                        token: null
                    }
                })
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invitation Information</DialogTitle>
                </DialogHeader>
                {content()}
            </DialogContent>
        </Dialog>
    )

}

export default AcceptInvitationDialog