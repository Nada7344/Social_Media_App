"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_js_1 = require("../../config/config.js");
const node_crypto_1 = require("node:crypto");
const domain_exception_js_1 = require("../exceptions/domain.exception.js");
const multer_enum_js_1 = require("../enums/multer.enum.js");
const node_fs_1 = require("node:fs");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_js_1.AWS_REGION,
            credentials: {
                accessKeyId: config_js_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_js_1.AWS_SECRAT_ACCESS_KEY
            }
        });
    }
    async uploadAsset({ storageApproach = multer_enum_js_1.StorageApproachEnum.MEMORY, Bucket = config_js_1.AWS_BUCKET_NAME, path = "general", file, ACL = client_s3_1.ObjectCannedACL.private, ContentType }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `${config_js_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
            ACL,
            Body: storageApproach === multer_enum_js_1.StorageApproachEnum.MEMORY ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype || ContentType
        });
        if (!command.input?.Key) {
            throw new domain_exception_js_1.BadRequestException("Fail to upload this asset");
        }
        await this.client.send(command);
        console.log(command.input?.Key);
        return command.input?.Key;
    }
    async uploadLargeAsset({ storageApproach = multer_enum_js_1.StorageApproachEnum.MEMORY, Bucket = config_js_1.AWS_BUCKET_NAME, path = "general", file, ACL = client_s3_1.ObjectCannedACL.private, ContentType }) {
        const uploadFile = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket,
                Key: `${config_js_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
                ACL,
                Body: storageApproach === multer_enum_js_1.StorageApproachEnum.MEMORY ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
                ContentType: file.mimetype || ContentType
            }
        });
        uploadFile.on("httpUploadProgress", (progress) => {
            console.log(progress);
            console.log(`File upload is ${(progress.loaded / progress.total * 100)} %`);
        });
        return await uploadFile.done();
    }
    async uploadAssets({ storageApproach = multer_enum_js_1.StorageApproachEnum.MEMORY, uploadApproach = multer_enum_js_1.UploadApproachEnum.SMALL, Bucket = config_js_1.AWS_BUCKET_NAME, path = "general", files, ACL, ContentType }) {
        let urls = [];
        if (uploadApproach === multer_enum_js_1.UploadApproachEnum.LARGE) {
            const data = await Promise.all(files.map((file) => {
                return this.uploadLargeAsset({
                    storageApproach,
                    file,
                    ACL,
                    Bucket,
                    ContentType,
                    path
                });
            }));
            urls = data.map(ele => ele.Key);
        }
        else {
            await Promise.all(files.map((file) => {
                return this.uploadAsset({
                    storageApproach,
                    file,
                    ACL,
                    Bucket,
                    ContentType,
                    path
                });
            }));
        }
        return urls;
    }
    async createPresignedUploadLink({ Bucket = config_js_1.AWS_BUCKET_NAME, path = "general", expiresIn = config_js_1.AWS_EXPIRE_IN, ContentType, originalname }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `${config_js_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}__${originalname}`,
            ContentType: ContentType
        });
        if (!command.input?.Key) {
            throw new domain_exception_js_1.BadRequestException("Fail to upload this asset");
        }
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return { url, Key: command.input?.Key };
    }
    async createPresignedFetchLink({ Bucket = config_js_1.AWS_BUCKET_NAME, Key, expiresIn = config_js_1.AWS_EXPIRE_IN, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return url;
    }
    async getAsset({ Bucket = config_js_1.AWS_BUCKET_NAME, Key }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
        });
        return await this.client.send(command);
    }
    async deleteAsset({ Bucket = config_js_1.AWS_BUCKET_NAME, Key }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key,
        });
        return await this.client.send(command);
    }
    async deleteAssets({ Bucket = config_js_1.AWS_BUCKET_NAME, Keys }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys,
                Quiet: false
            }
        });
        return await this.client.send(command);
    }
    async listFolderDir({ Bucket = config_js_1.AWS_BUCKET_NAME, prefix }) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket,
            Prefix: `${config_js_1.APPLICATION_NAME}/${prefix}`
        });
        return await this.client.send(command);
    }
    async deleteFolderByPrefix({ Bucket = config_js_1.AWS_BUCKET_NAME, prefix }) {
        const result = await this.listFolderDir({ prefix });
        const Keys = result.Contents?.map(ele => { return { Key: ele.Key }; });
        return this.deleteAssets({ Bucket, Keys });
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
