import { NextApiRequest, NextApiResponse } from 'next';
import { fetchBooking, fetchTimeReportsByBookingId } from '../../../../../lib/db-access';
import { insertTimeReport, validateTimeReportObjectionModel } from '../../../../../lib/db-access/timeReport';
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
import { logChangeToBooking, BookingChangelogEntryType } from '../../../../../lib/changelogUtils';

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
                if (!req.body.timeReport) {
                    throw Error('Missing time report parameter');
                }
                if (
                    context.currentUser.role == Role.READONLY ||
                    (booking.status === Status.DONE && context.currentUser.role !== Role.ADMIN)
                ) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }
                if (!validateTimeReportObjectionModel(req.body.timeReport)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }
                await insertTimeReport(req.body.timeReport)
                    .then(async (result) => {
                        await logChangeToBooking(
                            context.currentUser,
                            bookingId,
                            booking.name,
                            BookingChangelogEntryType.TIMEREPORT,
                        ).then(() => res.status(200).json(result));
                    })
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'GET':
                await fetchTimeReportsByBookingId(bookingId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
