import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGetInvitationInfo } from "@/services/public/invitation/query"
import { updateDialogsStore, useDialogsStore_acceptInvitationDialog } from "@/stores/dialogs"
import Spinner from "../Spinner"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const AcceptInvitationDialog = () => {

    const { open, token } = useDialogsStore_acceptInvitationDialog()

    const {
        data: invitationInfo,
        isLoading: getInvitationInfoIsLoading,
        isError: getInvitationInfoIsError,
        error: getInvitationInfoError
    } = useGetInvitationInfo(token)

    const content = () => {
        if (getInvitationInfoIsLoading) {
            return <Spinner />
        }
        if (getInvitationInfoIsError) {
            return <p className="text-destructive" >Error: {getInvitationInfoError.message}</p>
        }
        if (!getInvitationInfoIsLoading && !getInvitationInfoIsError && invitationInfo) {
            return (
                <div
                    className={cn(
                        `flex flex-col gap-4`
                    )}
                >
                    <div className="flex gap-2 items-center" >
                        <p>Workspace</p>
                        <p className="text-lg font-bold" >{invitationInfo.workspace_name}</p>
                    </div>
                    <div className="flex gap-2 items-center" >
                        <p>Sent by</p>
                        <p className="text-lg font-bold" >{invitationInfo.sender_firstname} {invitationInfo.sender_lastname}</p>
                    </div>
                    {
                        invitationInfo.accepted &&
                        <Card className="w-full" >
                            <p className="text-destructive text-center" >You have already accepted this invitation</p>
                        </Card>
                    }
                </div>
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
                <div>
                    {content()}
                </div>
            </DialogContent>
        </Dialog>
    )

}

export default AcceptInvitationDialog