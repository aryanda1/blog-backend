import { S3Client } from "@aws-sdk/client-s3";

const config = {
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_IDD,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEYY,
  },
};
const s3 = new S3Client(config);

export default s3;
