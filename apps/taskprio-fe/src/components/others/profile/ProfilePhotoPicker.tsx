import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import React, { useLayoutEffect, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { ImageIcon } from "lucide-react";
import { useUpdateProfilePhotoCrop, useUpdateUserProfilePhoto } from "@/services/private/profile/mutation";
import { TProfilePhoto } from "@repo/taskprio-types/src";
import { ProfilePhotoUrl } from "@/lib/globals";

type TProfilePhotoPickerProps = {
    profilePhoto? : TProfilePhoto
}

const ProfilePhotoPicker : React.FC<TProfilePhotoPickerProps> = ({ profilePhoto }) => {

    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        mutateAsync : updateUserProfilePhotoTrigger,
        isPending : isUpdatingUserProfilePhoto
    } = useUpdateUserProfilePhoto( () => {
        setOpen( false )
        resetState()
    } )
    
    const {
        mutateAsync : updateProfilePhotoCropTrigger,
        isPending : updateProfilePhotoIsPending
    } = useUpdateProfilePhotoCrop({
        onSuccess : () => {
            setOpen( false )
            resetState()
        }
    })

    const [ imageFile, setImageFile ] = useState<File | null>( null )
    const [ imageSrc, setImageSrc ] = useState<string | null>( null )
    const [ imageSize, setImageSize ] = useState<{ width: number, height: number } | null>( null )
    const [ open, setOpen ] = useState( false )
    const [ crop, setCrop ] = useState({ x: 0, y: 0 })
    const [ zoom, setZoom ] = useState(1)
    const [ cropArea, setCropArea ] = useState<Area | null>( null )

    const [ replace, setReplace ] = useState<boolean>(false)

    const previewCanvasRef = useRef<HTMLCanvasElement>(null)

    const handleFileChange = ( e : React.ChangeEvent<HTMLInputElement> ) => {
        const file = e.target.files?.[0]
        setImageFile( file || null )
        if ( file ) {
            const reader = new FileReader()
            reader.onload = ( event ) => {
                const result = event.target?.result as string
                setImageSrc( result )
                const img = new Image()
                img.onload = () => {
                    setImageSize({ width: img.width, height: img.height })
                }
                img.src = result
            }
            reader.readAsDataURL( file )
        }
    }

    const onCropComplete = ( croppedArea : Area ) => {
        setCropArea(croppedArea)
        if ( imageSize ) {
            handlePreview( croppedArea )
        }
    }

    const resetState = () => {
        setImageSrc( null )
        setImageSize( null )
        setCropArea( null )
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setReplace(false)
        if ( fileInputRef.current ) {
            fileInputRef.current.value = ""
        }
    }

    const handlePreview = ( croppedArea : Area ) => {

        const canvas = previewCanvasRef.current!
        const ctx = canvas.getContext( "2d" )

        canvas.width = imageSize!.width / 100 * croppedArea!.width
        canvas.height = imageSize!.height / 100 * croppedArea!.height

        const img = new Image()
        img.onload = () => {

            const posX = imageSize?.width! / 100 * croppedArea!.x
            const posY = imageSize?.height! / 100 * croppedArea!.y
            const width = imageSize?.width! / 100 * croppedArea!.width
            const height = imageSize?.height! / 100 * croppedArea!.height

            ctx!.drawImage(
                img,
                posX,
                posY,
                width,
                height,
                0,
                0,
                canvas.width,
                canvas.height
            )
        }
        img.src = imageSrc!
    }

    const handleApply = () => {
        if ( profilePhoto && !replace ) {
            if ( imageSize && cropArea ) {
                updateProfilePhotoCropTrigger({
                    crop_area : cropArea
                })
            }
        } else {
            if ( imageSrc && cropArea && imageSize && imageFile ) {
                updateUserProfilePhotoTrigger({
                    crop_area : cropArea,
                    file : imageFile
                })
            }
        }

    }

    useLayoutEffect( () => {
        if ( profilePhoto && open ) {
            setImageSrc(`${ProfilePhotoUrl}/${profilePhoto.user_id}/${profilePhoto.photo_file_name}?v=${profilePhoto.last_modified}`)
            setCropArea({
                x : profilePhoto.crop_x,
                y : profilePhoto.crop_y,
                width : profilePhoto.crop_width,
                height : profilePhoto.crop_height
            })
        }
    }, [ profilePhoto, open ])

    return (
        <div
            className={cn(
                ` size-[10rem] `
            )}
        >
            <div
                className={cn(
                    ` flex items-center justify-center `,
                    ` size-[10rem] rounded-full bg-muted-foreground `,
                    ` overflow-hidden cursor-pointer `
                )}
                onClick={() => {
                    setOpen( true )
                }}
            >
                {
                    profilePhoto ?
                    <img
                        src={`${ProfilePhotoUrl}/${profilePhoto.user_id}/${profilePhoto.photo_file_name.replace("ppxoriginal", "512x512")}?v=${profilePhoto.last_modified}`}
                    />
                    :
                    <Camera className=" size-[4rem] text-background " />
                }
            </div>
            <Dialog
                open={open}
                onOpenChange={ open => {
                    if ( open ) {
                        resetState()
                        setReplace(false)
                    }
                    setOpen( open )
                } }
            >
                <DialogContent
                    className=" w-[60rem] !max-w-[100dvw] "
                >
                    <DialogHeader>
                        <DialogTitle>Update Profile Photo</DialogTitle>
                    </DialogHeader>
                    <div
                        className={cn(
                            ` relative `
                        )}
                    >
                        {
                            imageSrc ? (
                                <div
                                    className={cn(
                                        ` flex space-x-4 `
                                    )}
                                >
                                    <div
                                        className={cn(
                                            ` relative size-[40rem] min-w-[40rem] rounded-md overflow-hidden `
                                        )}
                                    >
                                        <Cropper
                                            image={imageSrc}
                                            crop={crop}
                                            onCropChange={setCrop}
                                            initialCroppedAreaPercentages={cropArea ? cropArea : undefined}

                                            cropSize={{ width: 400, height: 400 }}

                                            minZoom={1}
                                            maxZoom={2}
                                            zoom={zoom}
                                            onZoomChange={zoom => {
                                                setZoom(zoom)
                                            }}

                                            aspect={ imageSize?.width ? imageSize.width / imageSize.height : 1 }
                                            // aspect={ 1 }

                                            cropShape="round"
                                            onCropComplete={onCropComplete}

                                            onMediaLoaded={ size => {
                                                if ( imageSize === null ) {
                                                    console.log(size);
                                                    setImageSize({
                                                        width : size.naturalWidth ?? size.width,
                                                        height : size.naturalHeight ?? size.height
                                                    })
                                                }
                                            } }
                                        />
                                    </div>
                                    <div
                                        className=" grow flex flex-col space-y-4 "
                                    >
                                        <Label>Zoom</Label>
                                        <Slider
                                            value={[zoom]}
                                            min={1}
                                            max={2}
                                            step={0.01}
                                            onValueChange={ value => {
                                                setZoom(value[0])
                                            } }
                                            disabled={isUpdatingUserProfilePhoto}
                                        />
                                        <div
                                            className=" flex flex-col gap-4 mt-auto "
                                        >
                                            <div
                                                className=" relative flex flex-col gap-2 items-center "
                                            >
                                                <canvas
                                                    ref={previewCanvasRef}
                                                    className=" size-[10rem] h-[10rem] object-cover bg-accent-foreground rounded-full "
                                                />
                                            </div>
                                            {
                                                !replace &&
                                                <Button
                                                    onClick={() => {
                                                        resetState()
                                                        setReplace(true)
                                                    }}
                                                    disabled={isUpdatingUserProfilePhoto || updateProfilePhotoIsPending}
                                                >Replace</Button>
                                            }
                                            <Button
                                                onClick={ () => {
                                                    handleApply()
                                                } }
                                                isLoading={isUpdatingUserProfilePhoto || updateProfilePhotoIsPending}
                                            >Apply</Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div
                                        className={cn(
                                            ` flex flex-col gap-4 items-center justify-center `,
                                            ` size-[20rem] mx-auto rounded-md bg-accent `,
                                            ` border-border border `
                                        )}
                                        onClick={() => {
                                            fileInputRef.current?.click()
                                        }}
                                    >
                                        <ImageIcon className=" size-[6rem] text-muted-foreground " />
                                        <p className=" text-center text-sm text-muted-foreground ">Drag and drop or click to upload</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className=" hidden "
                                        onChange={handleFileChange}
                                    />
                                </div>
                            )
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )

}

export default ProfilePhotoPicker;