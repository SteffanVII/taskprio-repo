
import AWS from "aws-sdk"
import dotenv from "dotenv";

dotenv.config();

let s3: AWS.S3;

export function initAWSS3() {

  const region = process.env.TASKPRIO_AWS_S3_BUCKET_REGION;
  const accessKeyId = process.env.TASKPRIO_AWS_IAM_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.TASKPRIO_AWS_IAM_S3_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS S3 credentials are not configured 🪣 ❌")
  }

  s3 = new AWS.S3({
    region: process.env.TASKPRIO_AWS_S3_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.TASKPRIO_AWS_IAM_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.TASKPRIO_AWS_IAM_S3_SECRET_KEY
    }
  })
  console.log("AWS S3 initialized 🪣  ✅")
}

export async function testAWSS3Connection() {
  try {
    const data = await s3.headBucket({ Bucket: process.env.TASKPRIO_AWS_S3_BUCKET_NAME }).promise()
    console.log("AWS S3 connection data", data, "🪣  ✅")
    console.log(`AWS S3 access to bucket "${process.env.TASKPRIO_AWS_S3_BUCKET_NAME}" successful 🪣  ✅`)
  } catch (error) {
    console.error("AWS S3 connection failed", error, "🪣  ❌")
  }
}

export function getAWSS3(): AWS.S3 {
  return s3
}