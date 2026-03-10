import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3_NOT_CONFIGURED =
  'S3 is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY in .env (see .env.example).';

@Injectable()
export class S3Service implements OnModuleInit {
  private client: S3Client | null = null;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly enabled: boolean;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT?.trim();
    const region = process.env.S3_REGION ?? 'us-east-1';
    const accessKey = process.env.S3_ACCESS_KEY?.trim();
    const secretKey = process.env.S3_SECRET_KEY?.trim();
    const bucket = process.env.S3_BUCKET ?? 'screenriot';

    this.enabled = !!(endpoint && accessKey && secretKey);
    this.bucket = bucket;
    this.endpoint = endpoint ? endpoint.replace(/\/$/, '') : '';

    if (this.enabled) {
      this.client = new S3Client({
        endpoint: this.endpoint,
        region,
        credentials: {
          accessKeyId: accessKey!,
          secretAccessKey: secretKey!,
        },
        forcePathStyle: true,
      });
    }
  }

  async onModuleInit() {
    if (this.enabled && this.client) {
      await this.ensureBucket();
    }
  }

  private get clientOrThrow(): S3Client {
    if (!this.enabled || !this.client) {
      throw new Error(S3_NOT_CONFIGURED);
    }
    return this.client;
  }

  private async ensureBucket() {
    const client = this.clientOrThrow;
    try {
      await client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async upload(
    key: string,
    body: Buffer | Uint8Array,
    contentType?: string,
  ): Promise<{ key: string; url: string }> {
    await this.clientOrThrow.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    const url = `${this.endpoint}/${this.bucket}/${key}`;
    return { key, url };
  }

  getPublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async getObject(
    key: string,
  ): Promise<{ body: Buffer; contentType?: string; contentLength?: number }> {
    const res = await this.clientOrThrow.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const chunks: Uint8Array[] = [];
    const stream = res.Body as unknown as AsyncIterable<Uint8Array>;
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    return { body, contentType: res.ContentType, contentLength: res.ContentLength };
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    // @smithy/types version mismatch between @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getSignedUrl(this.clientOrThrow as any, command as any, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    await this.clientOrThrow.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.clientOrThrow.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async ping(): Promise<void> {
    await this.clientOrThrow.send(
      new HeadBucketCommand({ Bucket: this.bucket }),
    );
  }
}
