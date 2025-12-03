import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGetProjectDeactivateTaskboards } from "@/services/private/taskboard/query";
import { updateDialogsStore } from "@/stores/dialogs";
import { TTaskboardInactiveForTable } from "@repo/taskprio-types/src";
import { Delete, RefreshCcw } from "lucide-react";
import React from "react";
import { useParams } from "react-router";

const DeactivatedTaskboards_ProjectSettingsPage : React.FC = () => {

    const {
        project_id
    } = useParams()

    const {
        data : projectInactiveTaskboards,
        isLoading : projectInactiveTaskboardsLoading,
        isError : projectInactiveTaskboardsIsError
    } = useGetProjectDeactivateTaskboards({
        project_id : project_id!
    })

    return (
        <React.Fragment>
            <div className=" flex flex-col space-y-2 " >
                <h3 className={` text-lg font-medium `} >Deactivated Taskboards</h3>
                <p className=" text-sm text-muted-foreground " >
                    Deactivated taskboards. These taskboards are hidden from the dashboard.
                </p>
            </div>
            <div
                className={cn(
                    `p-4 border border-transparent rounded-md`,
                    `hover:bg-secondary/50 hover:border-foreground/10`
                )}
            >
                <Card className="p-0" >
                    <Table>
                        <TableHeader className="border-b" >
                            <TableHead>Name</TableHead>
                            <TableHead>Sections</TableHead>
                            <TableHead>Tasks</TableHead>
                            <TableHead></TableHead>
                        </TableHeader>
                        <TableBody>
                            {
                                projectInactiveTaskboardsIsError &&
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <p className="text-destructive" >Error fetching deactivated taskboards.</p>
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                projectInactiveTaskboardsLoading &&
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Skeleton className="w-full h-[2rem]" />
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                (projectInactiveTaskboards?.length === 0 && !projectInactiveTaskboardsLoading) &&
                                <TableRow>
                                    <TableCell align="center" colSpan={4}>
                                        <p className="text-muted-foreground" >No deactivated taskboards found.</p>
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                projectInactiveTaskboards?.map( taskboard => (
                                    <DeactivateTaskboardRow
                                        key={taskboard.task_board_id}
                                        data={taskboard}
                                    />
                                ) )
                            }
                        </TableBody>
                    </Table>
                </Card>

            </div>
        </React.Fragment>
    )
    
}

export default DeactivatedTaskboards_ProjectSettingsPage;

type TDeactivateTaskboardRowProps = {
    data : TTaskboardInactiveForTable
}

const DeactivateTaskboardRow : React.FC<TDeactivateTaskboardRowProps> = ({ data }) => {

    const handleShowReactivateTaskboardDialog = () => {
        updateDialogsStore({
            reactivateTaskboardDialog : {
                open : true,
                taskboard : data
            }
        })
    }

    const handleShowDropTaskboardDialog = () => [
        updateDialogsStore({
            dropTaskboardDialog : {
                open : true,
                taskboard : data
            }
        })
    ]

    return (
        <TableRow>
            <TableCell className="font-bold" >{data.task_board_name}</TableCell>
            <TableCell>{data.sections}</TableCell>
            <TableCell>{data.tasks}</TableCell>
            <TableCell align="right" className="space-x-2" >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size={"icon-sm"} variant={"outline"} onClick={handleShowReactivateTaskboardDialog}><RefreshCcw/></Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore Taskboard</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size={"icon-sm"} variant={"destructive"} onClick={handleShowDropTaskboardDialog}><Delete/></Button>
                    </TooltipTrigger>
                    <TooltipContent>Drop Taskboard</TooltipContent>
                </Tooltip>
            </TableCell>
        </TableRow>
    )

}