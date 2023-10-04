import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithCustomErrorMessage,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { withSessionContext } from '../../../lib/sessionContext';
import { drive, auth, drive_v3 } from '@googleapis/drive';
import { GaxiosResponse } from 'googleapis-common';
import { FilesResult } from '../../../models/misc/FilesResult';
import { getValueOrFirst } from '../../../lib/utils';

const credentials = {
    type: 'service_account',
    private_key: process.env.DRIVE_PRIVATE_KEY,
    client_email: process.env.DRIVE_CLIENT_EMAIL,
};
const scopes = ['https://www.googleapis.com/auth/drive'];
const driveRootFolderId = process.env.DRIVE_ROOT_FOLDER_ID;

const driveClient = drive({
    version: 'v3',
    auth: new auth.GoogleAuth({ credentials, scopes }),
});

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const driveFolderId = getValueOrFirst(req.query.driveFolderId);

    const name = req.body.name;
    const parentName = req.body.parentName;

    switch (req.method) {
        case 'GET':
            if (!driveFolderId || !driveRootFolderId) {
                respondWithInvalidDataResponse(res);
                break;
            }
            await driveClient.files
                .list({
                    q: `\'${driveFolderId}\' in parents`,
                    fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                })
                .then(mapDriveResponse)
                .then((filesList) => res.status(200).json(filesList))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            break;

        case 'POST':
            if (!name || !parentName || !driveRootFolderId) {
                respondWithInvalidDataResponse(res);
                break;
            }

            await createFolderAndGetIdIfNotExists(parentName, driveRootFolderId)
                .then((parentId) => createFolderAndGetIdIfNotExists(name, parentId))
                .then((filesList) => res.status(200).json(filesList))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));

            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

const mapDriveResponse = (res: GaxiosResponse<drive_v3.Schema$FileList>): Promise<FilesResult[] | null> => {
    if (!res.data.files) {
        return Promise.resolve(null);
    }

    return Promise.all(
        res.data.files.map(async (x) => ({
            id: x.id as string,
            name: x.name ?? undefined,
            link: x.webViewLink ?? undefined,
            mimeType: x.mimeType ?? undefined,
            modifiedTime: x.modifiedTime ?? undefined,
        })),
    );
};

const createFolderAndGetIdIfNotExists = async (name: string, parentId: string) => {
    const itemsInParent = await driveClient.files
        .list({
            q: `\'${parentId}\' in parents`,
            fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
        })
        .then(mapDriveResponse);

    const existingFolder = itemsInParent?.find((x) => x.name === name);

    if (existingFolder) {
        return existingFolder.id;
    }

    const createdFolder = await driveClient.files.create({
        requestBody: {
            name: name,
            parents: [parentId],
            mimeType: 'application/vnd.google-apps.folder',
        },
        supportsAllDrives: true,
    });

    if (!createdFolder.data.id) {
        throw new Error('Could not created folder');
    }

    return createdFolder.data.id;
};

export default handler;
