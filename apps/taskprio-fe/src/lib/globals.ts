export const  ProfilePhotoUrl = `${import.meta.env.VITE_TASKPRIO_S3_BUCKET_OBJECT_URL}/${import.meta.env.VITE_TASKPRIO_S3_BUCKET_PROFILE_PHOTO_PATH}`

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};