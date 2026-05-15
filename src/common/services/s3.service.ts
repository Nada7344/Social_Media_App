import { CompleteMultipartUploadCommandOutput, DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, ListObjectsV2CommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { APPLICATION_NAME, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_EXPIRE_IN, AWS_REGION, AWS_SECRAT_ACCESS_KEY } from "../../config/config.js";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../exceptions/domain.exception.js";
import { StorageApproachEnum, UploadApproachEnum } from "../enums/multer.enum.js";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {

    private client: S3Client;
    constructor() {
        this.client = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRAT_ACCESS_KEY
            }
        })       
    }


    async uploadAsset({
        storageApproach = StorageApproachEnum.MEMORY,
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        file,
        ACL = ObjectCannedACL.private,
        ContentType

    }: {
        storageApproach?: StorageApproachEnum,
        Bucket?: string,
        path?: string,
        file: Express.Multer.File,
        ACL?: ObjectCannedACL | undefined,
        ContentType?: string | undefined

    }

    ): Promise<string> {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
            ACL,
            Body: storageApproach === StorageApproachEnum.MEMORY ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype || ContentType

        })
        if (!command.input?.Key) {
            throw new BadRequestException("Fail to upload this asset")
        }
        await this.client.send(command)
        console.log(command.input?.Key);

        return command.input?.Key
    }

    async uploadLargeAsset({
        storageApproach = StorageApproachEnum.MEMORY,
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        file,
        ACL = ObjectCannedACL.private,
        ContentType

    }: {
        storageApproach?: StorageApproachEnum,
        Bucket?: string,
        path?: string,
        file: Express.Multer.File,
        ACL?: ObjectCannedACL | undefined,
        ContentType?: string | undefined

    }): Promise<CompleteMultipartUploadCommandOutput> {
        const uploadFile = new Upload({
            client: this.client,
            params: {
                Bucket,
                Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
                ACL,
                Body: storageApproach === StorageApproachEnum.MEMORY ? file.buffer : createReadStream(file.path),
                ContentType: file.mimetype || ContentType
            }


        })
        uploadFile.on("httpUploadProgress", (progress) => {
            console.log(progress);
            console.log(`File upload is ${((progress.loaded as number) / (progress.total as number) * 100)} %`);

        })
        return await uploadFile.done()
    }

    async uploadAssets({
        storageApproach = StorageApproachEnum.MEMORY,
        uploadApproach = UploadApproachEnum.SMALL,
        Bucket = AWS_BUCKET_NAME,
        path = "general",
        files,
        ACL,
        ContentType

    }: {
        storageApproach: StorageApproachEnum,
        uploadApproach?: UploadApproachEnum,
        Bucket?: string,
        path?: string,
        files: Express.Multer.File[],
        ACL?: ObjectCannedACL,
        ContentType?: string

    }

    ): Promise<string[]> {

        let urls: string[] = []
        if (uploadApproach === UploadApproachEnum.LARGE) {

            const data = await Promise.all(
                files.map((file) => {
                    return this.uploadLargeAsset({
                        storageApproach,
                        file,
                        ACL,
                        Bucket,
                        ContentType,
                        path
                    })
                })
            )
            urls = data.map(ele => ele.Key as string)
        } else {
            await Promise.all(
                files.map((file) => {
                    return this.uploadAsset({
                        storageApproach,
                        file,
                        ACL,
                        Bucket,
                        ContentType,
                        path
                    })
                })
            )
        }


        return urls;
    }


    async createPresignedUploadLink({

        Bucket = AWS_BUCKET_NAME,
        path = "general",
        expiresIn = AWS_EXPIRE_IN,
        ContentType,
        originalname

    }: {

        Bucket?: string,
        path?: string,
        expiresIn: number,
        ContentType: string,
        originalname: string

    }

    ): Promise<{ url: string, Key: string }> {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${originalname}`,
            ContentType: ContentType

        })
        if (!command.input?.Key) {
            throw new BadRequestException("Fail to upload this asset")
        }

        const url = await getSignedUrl(this.client, command, { expiresIn })

        return { url, Key: command.input?.Key }
    }

     async createPresignedFetchLink({
        Bucket = AWS_BUCKET_NAME,
        Key,
        expiresIn = AWS_EXPIRE_IN,
    }: {

        Bucket?: string,
        Key: string,
         expiresIn:number
    }
    ): Promise<string> {
        const command = new GetObjectCommand({
            Bucket,
            Key,

        })

        const url = await getSignedUrl(this.client, command, { expiresIn })

        return url
    }

    async  getAsset({
        Bucket = AWS_BUCKET_NAME,
        Key
    }: {

        Bucket?: string,
        Key: string
    }
    ): Promise<GetObjectCommandOutput> {
        const command = new GetObjectCommand({
            Bucket,
            Key,

        })


        return await this.client.send(command)
    }


  async deleteAsset({
        Bucket = AWS_BUCKET_NAME,
        Key
    }: {

        Bucket?: string,
        Key: string
    }
    ): Promise<DeleteObjectCommandOutput> {
        const command = new DeleteObjectCommand({
            Bucket,
            Key,

        })

        return await this.client.send(command)
    }

  async deleteAssets({
        Bucket = AWS_BUCKET_NAME,
        Keys
    }: {

        Bucket?: string,
        Keys: {Key:string}[]
    }
    ): Promise<DeleteObjectsCommandOutput> {
        const command = new DeleteObjectsCommand({
            Bucket,
           Delete:{
                    Objects:Keys,
                    Quiet:false
           }

        })

        return await this.client.send(command)
    }
 async listFolderDir({
        Bucket = AWS_BUCKET_NAME,
        prefix
    }: {

        Bucket?: string,
        prefix: string
    }
    ): Promise<ListObjectsV2CommandOutput> {
        const command = new ListObjectsV2Command({
            Bucket,
            Prefix:`${APPLICATION_NAME}/${prefix}`

        })

        return await this.client.send(command)
    }
 async deleteFolderByPrefix({
        Bucket = AWS_BUCKET_NAME,
        prefix
    }: {

        Bucket?: string,
        prefix: string
    }
    ): Promise<ListObjectsV2CommandOutput> {
       const result =await this.listFolderDir({prefix})
       const Keys = result.Contents?.map(ele=>{return {Key:ele.Key}}) as {Key:string}[]   
        return this.deleteAssets({Bucket,Keys}) 
    }
}


export const s3Service = new S3Service()