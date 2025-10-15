import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { starterKitExtensions } from "@/lib/utils/shared"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { BoldIcon, ItalicIcon, ListIcon, ListOrderedIcon, UnderlineIcon } from "lucide-react"
import React from "react"

type TContentEditor_TaskboardTaskDialog = {
    content? : string,
    onContentChange : ( content : string ) => void
}

const ContentEditor_TaskboardTaskDialog : React.FC<TContentEditor_TaskboardTaskDialog> = ({
    content,
    onContentChange
}) => {

    const editor = useEditor({
        extensions : [
            starterKitExtensions
        ],
        editorProps : {
            attributes : {
                class : cn(
                    `min-h-[30rem] p-4`
                )
            }
        },
        onUpdate : ({editor}) => {
            if ( editor.isEmpty ) {
                onContentChange("")
            } else {
                onContentChange(editor.getHTML())
            }
        },
        content
    })

    const editorButtonsState = useEditorState({
        editor,
        selector : ({editor}) => {
            return {
                content : editor.getText(),
                isBold : editor.isActive("bold") ?? false,
                canBold : editor.can().chain().toggleBold().run() ?? false,
                isItalic : editor.isActive("italic") ?? false,
                canItalic : editor.can().chain().toggleItalic().run() ?? false,
                isUnderline : editor.isActive("underline") ?? false,
                canUnderline : editor.can().chain().toggleUnderline().run() ?? false,
                isList : editor.isActive("bulletList") ?? false,
                canList : editor.can().chain().toggleBulletList().run() ?? false,
                isListOrdered : editor.isActive("orderedList") ?? false,
                canListOrdered : editor.can().chain().toggleOrderedList().run() ?? false,
            }
        }
    })

    return (
        <div
            className={cn(
                `border rounded-md`
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
                    <BoldIcon/>
                </Toggle>
                <Toggle
                    pressed={editorButtonsState.isItalic}
                    disabled={!editorButtonsState.canItalic}
                    onClick={() => {
                        editor?.chain().focus().toggleItalic().run()
                    }}
                >
                    <ItalicIcon/>
                </Toggle>
                <Toggle
                    pressed={editorButtonsState.isUnderline}
                    disabled={!editorButtonsState.canUnderline}
                    onClick={() => {
                        editor?.chain().focus().toggleUnderline().run()
                    }}
                >
                    <UnderlineIcon/>
                </Toggle>
                <div className="h-6 border-r border-border my-auto" ></div>
                <Toggle
                    pressed={editorButtonsState.isList}
                    disabled={!editorButtonsState.canList}
                    onClick={() => {
                        editor?.chain().focus().toggleBulletList().run()
                    }}
                >
                    <ListIcon/>
                </Toggle>
                <Toggle
                    pressed={editorButtonsState.isListOrdered}
                    disabled={!editorButtonsState.canListOrdered}
                    onClick={() => {
                        editor?.chain().focus().toggleOrderedList().run()
                    }}
                >
                    <ListOrderedIcon/>
                </Toggle>
            </div>
            <EditorContent
                editor={editor}
            />
        </div>
    )

}

export default ContentEditor_TaskboardTaskDialog;