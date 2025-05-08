import { NextApiRequest, NextApiResponse } from 'next';
import { SessionContext, withSessionContext } from './sessionContext';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import {
    respondWithAccessDeniedResponse,
    respondWithBadRequestResponse,
    respondWithCustomErrorMessage,
    respondWithInvalidMethodResponse,
} from './apiResponses';
import { Role } from '../models/enums/Role';
import { getValueOrFirst } from './utils';

export const pictureUploadUrlHandler = (privatePicture: boolean = false) =>
    withSessionContext(async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        if (context.currentUser.role == Role.READONLY) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                const contentType = getValueOrFirst(req.query.contentType) ?? '';
                const key = req.url?.replace('/api', '').split('/pictureUploadUrl')[0] ?? '';

                if (contentType != 'png' && contentType != 'jpeg') {
                    respondWithBadRequestResponse(
                        res,
                        "URL parameter contentType is required and should be 'jpeg' or 'png'",
                    );
                    return;
                }

                const accessKeyId = process.env.BUCKETEER_AWS_ACCESS_KEY_ID;
                const secretAccessKey = process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY;
                const bucketName = process.env.BUCKETEER_BUCKET_NAME;
                const region = process.env.BUCKETEER_AWS_REGION;

                if (!(accessKeyId && secretAccessKey && bucketName && region)) {
                    const error = new Error('AWS credentials not in server environment');
                    respondWithCustomErrorMessage(res, error.message);
                    throw error;
                }

                const s3ClientConfig = {
                    region: region,
                    credentials: {
                        accessKeyId: accessKeyId,
                        secretAccessKey: secretAccessKey,
                    },
                };
                const pictureKey = privatePicture ? key : `public${key}`;
                const s3Client = new S3Client(s3ClientConfig);
                const maximumPictureSize = 10485760; // 10 MB
                const secondsToExpiration = 600;
                await createPresignedPost(s3Client, {
                    Bucket: bucketName,
                    Key: pictureKey,
                    Conditions: [
                        ['content-length-range', 0, maximumPictureSize],
                        { 'Content-Type': `image/${contentType}` },
                    ],
                    Fields: {
                        acl: 'public-read',
                        'Content-Type': `image/${contentType}`,
                    },
                    Expires: secondsToExpiration,
                })
                    .then((presignedPost) => res.status(200).json(presignedPost))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    });

// export const uploadPicture = (presignedPostJson) => {
//     fetch()
// }
