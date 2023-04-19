import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../../lib/apiResponses';
import { fetchBookingsReadyForCashPayment } from '../../../../lib/db-access/booking';
import { withSessionContext } from '../../../../lib/sessionContext';
import { Role } from '../../../../models/enums/Role';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            await fetchBookingsReadyForCashPayment()
                .then((result) => res.status(200).json(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));
            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
}, Role.CASH_PAYMENT_MANAGER);

export default handler;
