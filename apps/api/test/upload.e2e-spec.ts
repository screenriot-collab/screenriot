/**
 * E2E test: uploads a file via POST /upload and verifies it exists in S3/MinIO.
 * Requires MinIO running and S3_* env vars (e.g. docker compose up -d, then set S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET).
 * Skip when S3_ENDPOINT is not set (e.g. in CI without MinIO).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { S3Module } from '../src/s3/s3.module';
import { UploadModule } from '../src/upload/upload.module';
import { S3Service } from '../src/s3/s3.service';

const hasS3Config = () =>
  !!(
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY &&
    process.env.S3_SECRET_KEY
  );

describe('Upload (e2e) – file lands in storage', () => {
  let app: INestApplication;
  let s3Service: S3Service;

  beforeAll(async () => {
    if (!hasS3Config()) {
      console.warn(
        'Skipping upload e2e: set S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY (e.g. MinIO)',
      );
      return;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [S3Module, UploadModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    s3Service = moduleFixture.get(S3Service);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('uploads file and it exists in storage', async () => {
    if (!hasS3Config()) return;

    const pngBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    const res = await request(app.getHttpServer())
      .post('/upload')
      .attach('file', pngBytes, { filename: 'test.png', contentType: 'image/png' })
      .expect(201);

    expect(res.body).toHaveProperty('key');
    expect(res.body).toHaveProperty('url');
    expect(typeof res.body.key).toBe('string');
    expect(res.body.key.length).toBeGreaterThan(0);

    const exists = await s3Service.exists(res.body.key);
    expect(exists).toBe(true);
  });
});
