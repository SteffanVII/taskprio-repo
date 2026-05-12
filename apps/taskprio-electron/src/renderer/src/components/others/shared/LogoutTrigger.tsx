import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLogout } from "@/lib/hooks/useLogout"
import { LogOut } from "lucide-react"
import { useState } from "react"
import Spinner from "../Spinner"

const LogoutTrigger = ( props : { children? : React.ReactElement } ) => {

    const [
        isOpen,
        setIsOpen
    ] = useState(false)

    const {
        logout,
        isLogoutPending
    } = useLogout()

    const handleLogout = async () => {
        logout()
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={ ( open : boolean ) => {
                if ( !isLogoutPending ) {
                    setIsOpen(open)
                }
            }}
        >
            <DialogTrigger
                onClick={ e => {
                    e.stopPropagation()
                    setIsOpen(true)
                }}
                render={
                    props.children ? 
                    props.children
                    :
                    <Button
                        size={"sm"}
                        variant={"outline"}
                    ><LogOut className=" size-4 "/> Logout</Button>
                }
            />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to logout?</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant={"destructive"}
                        onClick={() => {
                            handleLogout()
                        }}
                    >
                        {
                            isLogoutPending ? (
                                <Spinner size="sm" />
                            ) : "Logout"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default LogoutTrigger;