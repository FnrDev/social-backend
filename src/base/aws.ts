import S3 from 'aws-sdk/clients/s3';

export const bucket = new S3({
    endpoint: process.env.AWS_S3_ENDPOINT,
    signatureVersion: "v4",
    secretAccessKey: process.env.AWS_S3_SECRET,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY
});