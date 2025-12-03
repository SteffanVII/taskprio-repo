import ProfilePhotoPicker from "@/components/others/profile/ProfilePhotoPicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetUserProfile } from "@/services/private/profile/query";
import { X } from "lucide-react";
import { useNavigate } from "react-router";


const ProfilePage = () => {

    const navigate = useNavigate()

    const {
        data : profileData,
        // isLoading : isLoadingProfileData
    } = useGetUserProfile()

    return (
        <div
            className={cn(
                ` w-screen h-screen max-w-screen max-h-screen `,
            )}
        >
            <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => {
                    navigate(-1)
                }}
                className={cn(
                    ` absolute top-8 right-8 `,
                    ` size-16 rounded-full cursor-pointer `
                )}
            >
                <X className=" size-8 " />
            </Button>
            <div
                className={cn(
                    ` relative `,
                    ` w-full max-w-[60rem] `,
                    ` mx-auto py-44 space-y-[3rem] `
                )}
            >
                <h1
                    className={cn(
                        ` text-4xl font-medium `
                    )}
                >My Profile</h1>

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
                                        <Badge>{profileData.email}</Badge>  
                                    </div>
                                </div>
                            )
                        }
                    </>

                </div>
            </div>
        </div>
    )

}

export default ProfilePage;