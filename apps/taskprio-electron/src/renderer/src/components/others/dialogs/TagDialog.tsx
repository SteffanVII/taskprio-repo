import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { updateDialogsStore, useDialogsStore_tagDialog } from "@/stores/dialogs";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { HexColorPicker } from "react-colorful";
import { useCreateProjectTag, useUpdateProjectTag } from "@/services/private/tag/mutation";
import { useLayoutEffect } from "react";
import { useProjectStore_selectedProject } from "@/stores/project";
import TagDeleteDialog from "./TagDeleteDialog";
import Spinner from "../Spinner";

const tagSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    color: z.string().min(1, { message: "Color is required." })
})

const TagDialog = () => {

    const selectedProject = useProjectStore_selectedProject()

    const {
        open,
        tag
    } = useDialogsStore_tagDialog()

    const form = useForm<z.infer<typeof tagSchema>>({
        resolver: zodResolver(tagSchema),
        defaultValues: {
            name: "",
            color: "#FFFFFF"
        }
    })

    const name = form.watch("name")
    const color = form.watch("color")

    const {
        mutateAsync: createProjectTagTrigger,
        isPending: createProjectTagTriggerIsPending
    } = useCreateProjectTag(
        () => {
            closeTagDialog()
        }
    )

    const {
        mutateAsync: updateProjectTagTrigger,
        isPending: updateProjectTagTriggerIsPending
    } = useUpdateProjectTag(
        () => {
            closeTagDialog()
        }
    )

    const onSubmit = (data: z.infer<typeof tagSchema>) => {

        if (tag) {

            updateProjectTagTrigger({
                params: {
                    tag_id: tag.tag_id,
                    project_id: tag.project_id
                },
                body: {
                    name: data.name,
                    color: data.color
                }
            })

        } else {

            createProjectTagTrigger({
                params: {
                    project_id: selectedProject!.project_id
                },
                body: {
                    name: data.name,
                    color: data.color
                }
            })

        }

    }

    const closeTagDialog = () => {
        updateDialogsStore({
            tagDialog: {
                open: false,
                tag: null
            }
        })
    }

    useLayoutEffect(() => {
        if (open) {
            if (tag) {
                form.reset({
                    name: tag.tag_name,
                    color: tag.tag_color
                })
            } else {
                form.reset({
                    name: "",
                    color: "#FFFFFF"
                })
            }
        }
    }, [open, tag])

    return (
        <Dialog
            open={open}
            onOpenChange={open => {
                if (!open) {
                    closeTagDialog()
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{tag ? "Edit Tag" : "Create Tag"}</DialogTitle>
                </DialogHeader>
                <Form
                    {...form}
                >
                    <form
                        className={cn(
                            ` flex flex-col space-y-4 `
                        )}
                        onSubmit={form.handleSubmit(onSubmit)}
                    >

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Tag Name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div
                            className={cn(
                                ` flex gap-4 `
                            )}
                        >
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <HexColorPicker
                                                color={field.value}
                                                onChange={value => {
                                                    field.onChange(value)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div
                                className={cn(
                                    ` relative flex grow justify-center items-center `
                                )}
                            >
                                <span
                                    className={cn(
                                        ` max-w-full `,
                                        ` text-center px-4 py-2 rounded-md border `,
                                    )}
                                    style={{
                                        borderColor : `${color}80`,
                                        backgroundColor: `${color}1a`,
                                        // backgroundColor: color,
                                        // color: getHexLuminance(color) > 0.5 ? "black" : "white"
                                    }}
                                >{!!name ? name : "Tag Name"}</span>
                            </div>
                        </div>
                    </form>
                </Form>
                <DialogFooter>
                    {
                        tag && (
                            <TagDeleteDialog
                                tag={tag}
                                onSuccess={() => {
                                    closeTagDialog()
                                }}
                            />
                        )
                    }
                    <Button
                        variant={"outline"}
                        onClick={() => {
                            form.handleSubmit(onSubmit)()
                        }}
                        disabled={
                            createProjectTagTriggerIsPending || updateProjectTagTriggerIsPending
                        }
                    >
                        {
                            createProjectTagTriggerIsPending || updateProjectTagTriggerIsPending ? <Spinner /> : tag ? "Update" : "Create"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}

export default TagDialog;