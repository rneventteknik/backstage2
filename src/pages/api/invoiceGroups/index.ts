import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../models/enums/Role';
import {
    respondWithAccessDeniedResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { fetchInvoiceGroups, insertInvoiceGroup, validateInvoiceGroupObjectionModel } from '../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        switch (req.method) {
            case 'POST':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!req.body.invoiceGroup) {
                    throw Error('Missing invoiceGroup parameter');
                }

                if (!validateInvoiceGroupObjectionModel(req.body.invoiceGroup)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertInvoiceGroup(req.body.invoiceGroup)
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            case 'GET':
                await fetchInvoiceGroups()
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }

        return;
    },
);

export default handler;
