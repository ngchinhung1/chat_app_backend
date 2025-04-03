"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    driver: process.env.STORAGE_DRIVER || 'local',
    local: {
        uploadPath: process.env.LOCAL_UPLOAD_PATH || './uploads/profile',
    },
    s3: {
        bucket: process.env.S3_BUCKET,
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION,
    },
});
