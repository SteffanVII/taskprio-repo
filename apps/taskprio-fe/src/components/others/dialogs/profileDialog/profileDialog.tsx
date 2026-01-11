import ProfilePhotoPicker from "@/components/others/profile/ProfilePhotoPicker";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useGetUserProfile } from "@/services/private/profile/query";
import { updateDialogsStore, useDialogsStore_profileDialog } from "@/stores/dialogs";

const ProfileDialog = () => {

    const { open } = useDialogsStore_profileDialog()

    const {
        data: profileData,
        // isLoading : isLoadingProfileData
    } = useGetUserProfile()

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                updateDialogsStore({
                    profileDialog: {
                        open: val
                    }
                })
            }}
        >
            <DialogContent
                className={cn(
                    ` w-full !max-w-[60rem] `,
                    // Ensure it doesn't cover titlebar (approx 3rem)
                    ` mt-[3rem] `,
                    ` max-h-[calc(100vh-6rem)] overflow-y-auto `
                )}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium">My Profile</DialogTitle>
                    {profileData?.email && (
                        <DialogDescription>
                            {/* Hidden or minimal description if needed, or just keep structural validity */}
                            Manage your profile settings.
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div
                    className={cn(
                        ` w-full `,
                        ` mx-auto py-6 space-y-[3rem] `
                    )}
                >
                    <div
                        className={cn(
                            ` w-full  `,
                            ` flex flex-col `
                        )}
                    >
                        <>
                            {
                                profileData && (
                                    <div
                                        className={cn(
                                            ` flex space-x-[3rem] `
                                        )}
                                    >
                                        <ProfilePhotoPicker
                                            profilePhoto={profileData.profile_photo || undefined}
                                        />
                                        <div
                                            className=" my-auto space-y-[1rem] "
                                        >
                                            <p className=" text-3xl " >{profileData.firstname} {profileData.lastname}</p>
                                            <Badge variant={"outline"} >{profileData.email}</Badge>
                                        </div>
                                    </div>
                                )
                            }
                        </>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )

}

export default ProfileDialog;
