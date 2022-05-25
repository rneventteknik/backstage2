import { NextApiRequest, NextApiResponse } from 'next';
import { fetchBooking, fetchTimeEstimatesByBookingId } from '../../../../../lib/db-access';
import { insertTimeEstimate, validateTimeEstimateObjectionModel } from '../../../../../lib/db-access/timeEstimate';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
    respondWithEntityNotFoundResponse,
} from '../../../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { Role } from '../../../../../models/enums/Role';
import { toBooking } from '../../../../../lib/mappers/booking';
import { Status } from '../../../../../models/enums/Status';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);

        if (isNaN(bookingId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBooking(bookingId).then(toBooking);

        switch (req.method) {
            case 'POST':
                if (!req.body.timeEstimate) {
                    throw Error('Missing time estimate parameter');
                }
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                if (!validateTimeEstimateObjectionModel(req.body.timeEstimate)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }
                await insertTimeEstimate(req.body.timeEstimate)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'GET':
                await fetchTimeEstimatesByBookingId(bookingId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
