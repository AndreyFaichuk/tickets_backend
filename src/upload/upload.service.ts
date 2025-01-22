import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    },
  });

  constructor(private readonly configService: ConfigService) {}

  async upload(fileName: string, file: Buffer) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow('AWS_S3_AVATAR_BUCKET_NAME'),
        Key: fileName,
        Body: file,
      }),
    );
  }

  async getFileUrl(key: string): Promise<string> {
    const bucketName = this.configService.getOrThrow(
      'AWS_S3_AVATAR_BUCKET_NAME',
    );
    const region = this.configService.getOrThrow('AWS_S3_REGION');

    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    return fileUrl;
  }
}
