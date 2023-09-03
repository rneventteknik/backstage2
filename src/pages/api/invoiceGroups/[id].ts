import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import {
    deleteInvoiceGroup,
    fetchInvoiceGroup,
    updateInvoiceGroup,
    validateInvoiceGroupObjectionModel,
} from '../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const invoiceGroupId = Number(req.query.id);

        if (context.currentUser.role != Role.ADMIN) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        if (isNaN(invoiceGroupId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchInvoiceGroup(invoiceGroupId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'DELETE':
                await deleteInvoiceGroup(invoiceGroupId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'PUT':
                if (!validateInvoiceGroupObjectionModel(req.body.invoiceGroup)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await updateInvoiceGroup(invoiceGroupId, req.body.invoiceGroup)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
