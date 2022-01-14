import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_HOST,
  port: parseInt(process.env.MINIO_PORT, 10) || 9000,
  accessKey: process.env.MINIO_USER,
  secretKey: process.env.MINIO_PASS,
  useSSL: process.env.MINIO_SSL || false,
});

minioClient.makeBucket('test', '', async (err) => {
  if (err) return console.log(err);

  console.log('Bucket created successfully.');

  await minioClient.setBucketPolicy(
    'test',
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: ['s3:GetObject'],
          Effect: 'Allow',
          Principal: '*',
          Resource: ['arn:aws:s3:::test/*'],
          Sid: '',
        },
      ],
    }),
  );
  return null;
});

export default minioClient;
