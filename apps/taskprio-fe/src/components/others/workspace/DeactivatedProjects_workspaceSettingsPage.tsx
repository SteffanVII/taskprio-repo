import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGetDeactivatedProjects } from "@/services/private/project/query";
import { updateDialogsStore } from "@/stores/dialogs";
import { TProjectInactiveForTable } from "@repo/taskprio-types/src";
import { Delete, RefreshCcw } from "lucide-react";
import { useParams } from "react-router";


const DeactivatedProjects_WorkspaceSettingsPage = () => {

    const {
        workspace_id
    } = useParams()

    const {
        data : deactivatedProjects,
        isLoading : deactivatedProjectsIsLoading,
        isError : deactivatedProjectsIsError
    } = useGetDeactivatedProjects({
        payload : {
            workspace_id
        }
    })

    return (
        <>
            <div className="SettingsSectionHeader" >
                <h3 className={`SettingsSectionHeaderTitle`} >Deactivated Projects</h3>
                <p className="SettingsSectionHeaderDescription" >
                    Manage the deactivated projects
                </p>
            </div>
            <div
                className={cn(
                    `SettingsSectionContent`
                )}
            >
                <Card className="p-0" >
                    <Table>
                        <TableHeader className="border-b" >
                            <TableHead>Name</TableHead>
                            <TableHead>Taskboards</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead></TableHead>
                        </TableHeader>
                        <TableBody>
                            {
                                deactivatedProjectsIsError &&
                                <TableRow>
                                    <TableCell align="center" colSpan={4}>
                                        <p className="text-destructive" >Error fetching deactivated projects.</p>
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                deactivatedProjectsIsLoading &&
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Skeleton className="w-full h-[2rem]" />
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                (deactivatedProjects?.length === 0 && !deactivatedProjectsIsLoading) &&
                                <TableRow>
                                    <TableCell align="center" colSpan={4}>
                                        <p className="text-muted-foreground" >No deactivated projects found.</p>
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                deactivatedProjects?.map( project => (
                                    <DeactivateProjectRow
                                        key={project.project_id}
                                        data={project}
                                    />
                                ) )
                            }
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    )
}

export default DeactivatedProjects_WorkspaceSettingsPage;

type TDeactivateProjectRowProps = {
    data : TProjectInactiveForTable
}

const DeactivateProjectRow : React.FC<TDeactivateProjectRowProps> = ({ data }) => {

    const handleShowReactivateProjectDialog = () => {
        updateDialogsStore({
            reactivateProjectDialog : {
                open : true,
                project : data
            }
        })
    }

    const handleDropProjectDialog = () => {
        updateDialogsStore({
            dropProjectDialog : {
                open : true,
                project : data
            }
        })
    }

    return (
        <TableRow>
            <TableCell className="font-bold" >{data.project_name}</TableCell>
            <TableCell>{data.taskboards}</TableCell>
            <TableCell>{data.members}</TableCell>
            <TableCell align="right" className="space-x-2"  >
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button size={"icon-sm"} variant={"outline"} onClick={handleShowReactivateProjectDialog}><RefreshCcw/></Button>
                        }
                    />
                    <TooltipContent>Restore Project</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <Button size={"icon-sm"} variant={"destructive"} onClick={handleDropProjectDialog}><Delete/></Button>
                        }
                    />
                    <TooltipContent>Drop Project</TooltipContent>
                </Tooltip>
            </TableCell>
        </TableRow>
    )

}