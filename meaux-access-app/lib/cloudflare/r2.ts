import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!
const bucketName = process.env.R2_BUCKET_NAME!

export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
})

export async function uploadToR2(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
    })

    await r2Client.send(command)
    return `${process.env.R2_PUBLIC_URL}/${key}`
}

export async function listR2Objects(prefix?: string) {
    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
    })

    const response = await r2Client.send(command)
    return response.Contents || []
}

export async function getR2SignedUrl(key: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    })

    return await getSignedUrl(r2Client, command, { expiresIn })
}

