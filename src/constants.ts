type AwsBucketName = 'avatar' | 'attachments';

export const AWS_S3_BUCKETS: Record<
  AwsBucketName,
  { bucket: string; region: string }
> = {
  avatar: {
    bucket: 'AWS_S3_AVATAR_BUCKET_NAME',
    region: 'AWS_S3_AVATAR_REGION',
  },
  attachments: {
    bucket: 'AWS_S3_ATTACHMENTS_BUCKET_NAME',
    region: 'AWS_S3_ATTACHMENTS_REGION',
  },
} as const;

export const FILE_TYPES_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
};
