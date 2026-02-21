const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Create S3-compatible client for E2E Object Storage
const s3Client = new S3Client({
    endpoint: process.env.E2E_ENDPOINT,
    region: process.env.E2E_REGION || 'del1',
    credentials: {
        accessKeyId: process.env.E2E_ACCESS_KEY,
        secretAccessKey: process.env.E2E_SECRET_KEY
    },
    forcePathStyle: true // Required for S3-compatible services
});

const BUCKET_NAME = process.env.E2E_BUCKET_NAME;

/**
 * Generate a pre-signed URL for uploading a file
 * @param {string} key - The object key (path) in the bucket
 * @param {string} contentType - MIME type of the file
 * @param {number} expiresIn - URL expiry time in seconds (default: 1 hour)
 */
async function getUploadUrl(key, contentType = 'video/mp2t', expiresIn = 3600) {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
}

/**
 * Generate a pre-signed URL for downloading/streaming a file
 * @param {string} key - The object key (path) in the bucket
 * @param {number} expiresIn - URL expiry time in seconds (default: 4 hours)
 */
async function getDownloadUrl(key, expiresIn = 14400) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
}

/**
 * Generate pre-signed URLs for all segments of an HLS stream
 * @param {string} basePath - Base path in bucket (folder containing .m3u8 and .ts files)
 * @param {number} expiresIn - URL expiry time in seconds
 */
async function getHLSStreamUrls(basePath, expiresIn = 14400) {
    // Get signed URL for the master .m3u8 playlist
    const playlistUrl = await getDownloadUrl(`${basePath}/index.m3u8`, expiresIn);

    return {
        playlistUrl,
        basePath
    };
}

module.exports = {
    s3Client,
    getUploadUrl,
    getDownloadUrl,
    getHLSStreamUrls,
    BUCKET_NAME
};
