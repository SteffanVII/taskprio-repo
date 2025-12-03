import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReplyIcon, SendHorizonalIcon, Trash2Icon } from "lucide-react";
import UserAvatar from "../../shared/UserAvatar";
import CommentEditor_CommentSection from "./CommentEditor_CommecntSection";
import React, { useState } from "react";
import { useGetTaskComments } from "@/services/private/task/query";
import { useAddTaskComment } from "@/services/private/task/mutation";
import { TTaskComment } from "@repo/taskprio-types/src";
import { EditorContent, useEditor } from "@tiptap/react";
import { useGlobalsStore_user } from "@/stores/globals";
import dayjs from "dayjs";
import { starterKitExtensions } from "@/lib/utils/shared";

type TCommentSection_TaskboardTaskDialog = {
    taskId : string
}

const CommentSection_TaskboardTaskDialog : React.FC<TCommentSection_TaskboardTaskDialog> = ({ taskId }) => {

    const {
        mutateAsync : addTaskCommentTrigger,
        isPending : isAddingTaskComment
    } = useAddTaskComment({
        onSuccess : () => {
            editor.commands.clearContent()
            setReplyingToTaskComment(null)
        }
    })

    const {
        data : comments
    } = useGetTaskComments({
        pathParameter : {
            task_id : taskId
        }
    })

    const [ replyingToTaskComment, setReplyingToTaskComment ] = useState<TTaskComment | null>(null)
    const [ commentContent, setCommentContent ] = useState<string>("")

    const editor = useEditor({
        extensions : [
            starterKitExtensions
        ],
        editorProps : {
            attributes : {
                class : cn(
                    `p-4`
                )
            }
        }
    })

    const handleAddComment = async () => {

        if ( !commentContent || commentContent.trim() === "" ) return

        await addTaskCommentTrigger({
            pathParameter : {
                task_id : taskId
            },
            body : {
                comment_content : commentContent,
                replying_to_task_comment_id : replyingToTaskComment?.task_comment_id || undefined
            }
        })

    }

    const handleReply = ( data : TTaskComment ) => {
        setReplyingToTaskComment(data)
        editor.commands.focus()
    }

    return (
        <div
            className="flex flex-col gap-4 mt-auto pt-4 "
        >
            <p className="px-4" >Comments</p>

            <div className="relative p-4 flex flex-col justify-center w-full" >
                {
                    comments && comments.length === 0 &&
                    <div className="w-full h-full flex items-center justify-center" >
                        <p className="text-muted-foreground" >No comments yet</p>
                    </div>
                }
                {
                    comments &&
                    comments.map( comment => <Comment key={comment.task_comment_id} data={comment} reply={handleReply} /> )
                }
            </div>

            {/* <div className="sticky bottom-0 w-full flex gap-4 p-4 bg-accent rounded-lg rounded-t-none border-t" > */}
            <div className="sticky bottom-0 w-full flex gap-4 p-4 bg-card rounded-lg rounded-t-none" >
                <CommentEditor_CommentSection
                    editor={editor}
                    onContentChange={setCommentContent}
                    replyingToTaskComment={replyingToTaskComment || undefined}
                    clearReplyingToTaskComment={() => setReplyingToTaskComment(null)}
                />
                <Button
                    size={"icon"}
                    onClick={handleAddComment}
                    isLoading={isAddingTaskComment}
                >
                    <SendHorizonalIcon/>
                </Button>
            </div>
        </div>
    )

}

export default CommentSection_TaskboardTaskDialog;

type TCommentProps = {
    data : TTaskComment,
    reply : ( data : TTaskComment ) => void
}

const Comment : React.FC<TCommentProps> = ({ data, reply }) => {

    const user = useGlobalsStore_user()

    const editor = useEditor({
        extensions : [
            starterKitExtensions
        ],
        content : data.comment_content,
        editable : false
    })

    const replyEditor = useEditor({
        extensions : [
            starterKitExtensions
        ],
        onCreate : ({editor}) => {
            if ( editor.getHTML().length > 500 ) {
                editor.commands.setContent(editor.getText().slice(0, 500) + "...")
            }
        },
        content : data.replying_to_task_comment?.comment_content,
        editorProps : {
            attributes : {
                class : cn(
                    `text-xs max-h-[4rem] overflow-hidden`
                )
            }
        },
        editable : false
    })

    return (
        <div
            className={cn(
                `group`,
                `w-full max-w-full grid gap-2 py-2 px-2 rounded-md`,
                `hover:bg-foreground/10`
            )}
            style={{
                gridTemplateColumns : "min-content 1fr"
            }}
        >
            <UserAvatar
                user_id_or_email={data.user?.email || ""}
                size="sm"
            />
            <div
                className={cn(
                    `relative w-full`,
                    `flex flex-col`
                )}
            >
                {
                    data.replying_to_task_comment &&
                    <div
                        className={cn(
                            `w-full max-w-full h-fit p-4 rounded-t-md bg-gradient-to-t from-transparent to-foreground/5 border border-b-0 border-foreground/10`,
                            `flex flex-col gap-2 opacity-50 transition-opacity`,
                            `group-hover:opacity-100`
                        )}
                    >
                        <p className="text-xs text-muted-foreground" >Reply to</p>
                        <div
                            className={cn(
                                `flex gap-4`
                            )}
                        >
                            <div className="h-fit flex items-center gap-2" >
                                <UserAvatar user_id_or_email={data.replying_to_task_comment.user?.email || ""} size="sm" />
                                <p className="text-xs font-medium" >{`${data.replying_to_task_comment.user?.firstname} ${data.replying_to_task_comment.user?.lastname}`}</p>
                            </div>
                            •
                            <EditorContent key={data.replying_to_task_comment.comment_content} editor={replyEditor} />
                        </div>
                    </div>
                }
                <div
                    className={cn(
                        `w-fit relative`,
                        `bg-foreground/20 rounded-md p-4`,
                        data.user?.email === user?.email && `bg-primary`
                    )}
                >
                    <EditorContent key={data.comment_content} editor={editor} className={cn( data.user?.email === user?.email && `text-primary-foreground` )} />
                </div>
                <div
                    className={cn(
                        `absolute top-0 right-[1rem] -translate-y-[calc(50%+0.5rem)]`,
                        `w-fit h-fit space-x-1`,
                        `opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto`
                    )}
                >
                    <Button
                        size={"icon"}
                        variant={"secondary"}
                        className="border shadow-lg"
                        title="Reply"
                        onClick={() => reply(data)}
                    >
                        <ReplyIcon/>
                    </Button>
                    <Button
                        size={"icon"}
                        variant={"secondary"}
                        className="border shadow-lg"
                        title="Delete"
                    >
                        <Trash2Icon/>
                    </Button>
                </div>
                <div
                    className="w-full flex items-center gap-2 pt-2"
                >
                    <p className="text-xs text-muted-foreground" >{ dayjs(data.created_at).fromNow() }</p>
                    <p className="text-xs text-muted-foreground" >{ data.user?.email === user?.email ? "• You" : `• ${data.user?.firstname} ${data.user?.lastname}` }</p>
                </div>
            </div>
        </div>
    )

}