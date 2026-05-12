import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { starterKitExtensions } from "@/lib/utils/shared"
import { TTaskComment } from "@repo/taskprio-types"
import { Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react"
import { BoldIcon, ItalicIcon, ListIcon, ListOrderedIcon, UnderlineIcon, X } from "lucide-react"
import React, { useEffect } from "react"

type TCommentEditor_CommentSection = {
    editor: Editor
    onContentChange: (content: string) => void,
    clearReplyingToTaskComment: () => void,
    replyingToTaskComment?: TTaskComment,
}

const CommentEditor_CommentSection: React.FC<TCommentEditor_CommentSection> = ({
    editor,
    onContentChange,
    clearReplyingToTaskComment,
    replyingToTaskComment
}) => {

    const editorButtonsState = useEditorState({
        editor,
        selector: ({ editor }) => {
            onContentChange(editor.getHTML())
            return {
                content: editor.getText(),
                isBold: editor.isActive("bold") ?? false,
                canBold: editor.can().chain().toggleBold().run() ?? false,
                isItalic: editor.isActive("italic") ?? false,
                canItalic: editor.can().chain().toggleItalic().run() ?? false,
                isUnderline: editor.isActive("underline") ?? false,
                canUnderline: editor.can().chain().toggleUnderline().run() ?? false,
                isList: editor.isActive("bulletList") ?? false,
                canList: editor.can().chain().toggleBulletList().run() ?? false,
                isListOrdered: editor.isActive("orderedList") ?? false,
                canListOrdered: editor.can().chain().toggleOrderedList().run() ?? false,
            }
        }
    })

    const replyEditor = useEditor({
        extensions: [
            starterKitExtensions
        ],
        editorProps: {
            attributes: {
                class: cn(
                    `max-h-[4rem] min-h-[2rem] text-xs overflow-hidden`
                )
            }
        },
        onUpdate: ({ editor }) => {
            if (editor.getText().length > 500) {
                editor.commands.setContent(editor.getText().slice(0, 500) + "...")
            }
        },
        editable: false
    })

    useEffect(() => {
        if (replyingToTaskComment) {
            replyEditor.commands.setContent(replyingToTaskComment.comment_content || "")
        } else {
            replyEditor.commands.clearContent()
        }
    }, [replyingToTaskComment])

    return (
        <div
            className={cn(
                `relative w-full`
            )}
        >
            {
                replyingToTaskComment &&
                <div
                    className={cn(
                        `w-full h-fit`,
                        `rounded-t-md border-x border-t`,
                        `grid`,
                        `translate-y-[0.3rem]`
                    )}
                    style={{
                        gridTemplateColumns: "1fr min-content"
                    }}
                >
                    <div
                        className="w-full p-4 flex flex-col gap-2"
                    >
                        <p className="text-xs text-muted-foreground" >Replying to</p>
                        <div className="flex gap-4" >
                            <Badge className="h-fit" >{replyingToTaskComment?.user?.firstname} {replyingToTaskComment?.user?.lastname}</Badge>
                            <div
                                className="relative w-full h-fit"
                            >
                                <EditorContent
                                    key={replyingToTaskComment?.task_comment_id}
                                    editor={replyEditor}
                                />
                                <div
                                    className={cn(
                                        `absolute top-0 left-0`,
                                        `size-full`,
                                        `bg-gradient-to-t from-accent to-transparent to-20%`
                                    )}
                                >

                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        size={"icon"}
                        variant={"ghost"}
                        className="absolute top-1 right-1"
                        onClick={clearReplyingToTaskComment}
                    >
                        <X />
                    </Button>
                </div>
            }
            <div
                className={cn(
                    `relative w-full border rounded-md`
                )}
            >
                <div
                    className={cn(
                        `flex gap-1 p-1`
                    )}
                >
                    <Toggle
                        pressed={editorButtonsState.isBold}
                        disabled={!editorButtonsState.canBold}
                        onClick={() => {
                            editor?.chain().focus().toggleBold().run()
                        }}
                    >
                        <BoldIcon />
                    </Toggle>
                    <Toggle
                        pressed={editorButtonsState.isItalic}
                        disabled={!editorButtonsState.canItalic}
                        onClick={() => {
                            editor?.chain().focus().toggleItalic().run()
                        }}
                    >
                        <ItalicIcon />
                    </Toggle>
                    <Toggle
                        pressed={editorButtonsState.isUnderline}
                        disabled={!editorButtonsState.canUnderline}
                        onClick={() => {
                            editor?.chain().focus().toggleUnderline().run()
                        }}
                    >
                        <UnderlineIcon />
                    </Toggle>
                    <div className="h-6 border-r border-border my-auto" ></div>
                    <Toggle
                        pressed={editorButtonsState.isList}
                        disabled={!editorButtonsState.canList}
                        onClick={() => {
                            editor?.chain().focus().toggleBulletList().run()
                        }}
                    >
                        <ListIcon />
                    </Toggle>
                    <Toggle
                        pressed={editorButtonsState.isListOrdered}
                        disabled={!editorButtonsState.canListOrdered}
                        onClick={() => {
                            editor?.chain().focus().toggleOrderedList().run()
                        }}
                    >
                        <ListOrderedIcon />
                    </Toggle>
                </div>
                <EditorContent
                    editor={editor}
                />
            </div>
        </div>
    )

}

export default CommentEditor_CommentSection;