import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import getHexLuminance from "@/lib/utils/hexColorLuminance"
import { useDeleteProjectTag } from "@/services/private/tag/mutation"
import { TDeleteProjectTagResponse, TTag } from "@repo/taskprio-types/src"
import { Trash } from "lucide-react"
import { useState } from "react"
import Spinner from "../Spinner"

type TTagDeleteDialogProps = {
    tag : TTag,
    onSuccess? : ( data : TDeleteProjectTagResponse ) => void,
    trigger? : React.ReactElement
}

const TagDeleteDialog : React.FC<TTagDeleteDialogProps> = ({
    tag,
    onSuccess,
    trigger
}) => {

    const [ open, setOpen ] = useState(false)

    const {
        mutateAsync : deleteProjectTagTrigger,
        isPending : deleteProjectTagTriggerIsPending
    } = useDeleteProjectTag(
        data => {
            setOpen(false)
            onSuccess?.( data )
        }
    )

    const onDelete = () => {
        deleteProjectTagTrigger({
            params : {
                project_id : tag.project_id,
                tag_id : tag.tag_id
            }
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger
                render={
                    trigger ||
                    <Button
                        size={"icon"}
                        variant={"destructive"}
                    >
                        <Trash/>
                    </Button>
                }
            />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete <Badge style={{ backgroundColor : tag.tag_color, color : getHexLuminance(tag.tag_color) > 0.5 ? "black" : "white" }} >{ tag.tag_name }</Badge> tag?</DialogTitle>
                    <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant={"destructive"}
                        onClick={onDelete}
                        disabled={deleteProjectTagTriggerIsPending}
                    >
                        {
                            deleteProjectTagTriggerIsPending ? <Spinner/> : "Delete"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default TagDeleteDialog;