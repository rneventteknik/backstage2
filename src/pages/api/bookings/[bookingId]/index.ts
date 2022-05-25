import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import {
    deleteBooking,
    validateBookingObjectionModel,
    updateBooking,
    fetchBookingWithUser,
    fetchBooking,
} from '../../../../lib/db-access/booking';
import { toBooking } from '../../../../lib/mappers/booking';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import { Role } from '../../../../models/enums/Role';
import { Status } from '../../../../models/enums/Status';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);

        if (isNaN(bookingId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBooking(bookingId).then(toBooking);

        switch (req.method) {
            case 'GET':
                await fetchBookingWithUser(bookingId)
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

                await deleteBooking(bookingId)
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

                if (!validateBookingObjectionModel(req.body.booking)) {
                    respondWithCustomErrorMessage(res, 'Invalid booking');
                    return;
                }

                await updateBooking(bookingId, req.body.booking)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
