import { NextApiRequest, NextApiResponse } from 'next';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { Role } from '../../../../../models/enums/Role';
import {
    fetchTimeEstimate,
    updateTimeEstimate,
    deleteTimeEstimate,
    validateTimeEstimateObjectionModel,
    fetchBooking,
} from '../../../../../lib/db-access';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithAccessDeniedResponse,
} from '../../../../../lib/apiResponses';
import { toBooking } from '../../../../../lib/mappers/booking';
import { Status } from '../../../../../models/enums/Status';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);
        const timeEstimateId = Number(req.query.timeEstimateId);

        if (isNaN(bookingId) || isNaN(timeEstimateId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBooking(bookingId).then(toBooking);

        switch (req.method) {
            case 'GET':
                await fetchTimeEstimate(timeEstimateId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'DELETE':
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                await deleteTimeEstimate(timeEstimateId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'PUT':
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                if (!validateTimeEstimateObjectionModel(req.body.timeEstimate)) {
                    respondWithEntityNotFoundResponse(res);
                    return;
                }

                // TODO Write to changelog here when it is implemented??

                await updateTimeEstimate(timeEstimateId, req.body.timeEstimate)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithEntityNotFoundResponse(res);
        }
    },
);

export default handler;
