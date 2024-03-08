import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../lib/apiResponses';
import { fetchCustomers, insertCustomer, validateCustomerObjectionModel } from '../../../lib/db-access/customer';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
        switch (req.method) {
            case 'POST':
                if (context.currentUser.role != Role.ADMIN) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!req.body.customer) {
                    throw Error('Missing customer parameter');
                }

                if (!validateCustomerObjectionModel(req.body.customer)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertCustomer(req.body.customer)
                    .then((result) => res.status(200).json(result))
                    .catch((err) => res.status(500).json({ statusCode: 500, message: err.message }));

                break;

            case 'GET':
                await fetchCustomers()
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                return;

            default:
                respondWithEntityNotFoundResponse(res);
        }

        return;
    },
);

export default handler;
