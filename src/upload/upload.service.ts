import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { AWS_S3_BUCKETS } from 'src/constants';

@Injectable()
export class UploadService {
  private createS3Client(region: string): S3Client {
    return new S3Client({
      region,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  constructor(private readonly configService: ConfigService) {}

  async upload({
    fileName,
    file,
    bucket = this.configService.getOrThrow(AWS_S3_BUCKETS.avatar.bucket),
    region = this.configService.getOrThrow(AWS_S3_BUCKETS.avatar.region),
  }: {
    fileName: string;
    file: Buffer;
    bucket?: string;
    region?: string;
  }) {
    const s3Client = this.createS3Client(region);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file,
      }),
    );
  }

  getFileUrl({
    key,
    bucket = this.configService.getOrThrow(AWS_S3_BUCKETS.avatar.bucket),
    region = this.configService.getOrThrow(AWS_S3_BUCKETS.avatar.region),
  }: {
    key: string;
    bucket?: string;
    region?: string;
  }): string {
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return fileUrl;
  }

  async delete(prefix: string, bucket: string, region: string) {
    const s3Client = this.createS3Client(region);

    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const listResponse = await s3Client.send(listObjectsCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return;
    }

    const objectsToDelete = listResponse.Contents.map((obj) => ({
      Key: obj.Key,
    }));

    const deleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: objectsToDelete },
    });

    await s3Client.send(deleteObjectsCommand);
  }
}
