import { getAWSS3 } from "../index.js"
import dotenv from "dotenv";

dotenv.config();

export const uploadProfilePhotoToS3 = async (
    files : { key : string, buffer : Buffer }[]
) : Promise<string[]> => {

    try {
        await Promise.all(files.map(async (file) => {
            await getAWSS3().putObject({
                Bucket : process.env.TASKPRIO_AWS_S3_BUCKET_NAME,
                Key : file.key,
                Body : file.buffer
            }).promise()
        }))

        return files.map((file) => file.key);

    } catch (error) {
        console.log(error);
        throw error;
    }


}