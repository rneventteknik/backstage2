import { NextApiRequest, NextApiResponse } from 'next';
import { SessionContext, withSessionContext } from '../../../../../lib/sessionContext';
import { Role } from '../../../../../models/enums/Role';
import {
    fetchTimeReport,
    updateTimeReport,
    deleteTimeReport,
    validateTimeReportObjectionModel,
    fetchBooking,
} from '../../../../../lib/db-access';
import {
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithAccessDeniedResponse,
} from '../../../../../lib/apiResponses';
import { Status } from '../../../../../models/enums/Status';
import { logChangeToBooking, BookingChangelogEntryType, hasChanges } from '../../../../../lib/changelogUtils';
import { TimeReportObjectionModel } from '../../../../../models/objection-models/TimeReportObjectionModel';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);
        const timeReportId = Number(req.query.timeReportId);

        if (isNaN(bookingId) || isNaN(timeReportId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = await fetchBooking(bookingId);

        switch (req.method) {
            case 'GET':
                await fetchTimeReport(timeReportId)
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
                await deleteTimeReport(timeReportId)
                    .then((result) => {
                        logChangeToBooking(context.currentUser, bookingId, BookingChangelogEntryType.TIMEREPORT).then(
                            () => res.status(200).json(result),
                        );
                    })
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
                if (!validateTimeReportObjectionModel(req.body.timeReport)) {
                    respondWithEntityNotFoundResponse(res);
                    return;
                }

                await updateTimeReport(timeReportId, req.body.timeReport)
                    .then(async (result) => {
                        const newTimeReport = req.body.equipmentList as TimeReportObjectionModel;
                        const existingTimeReport = booking.timeReports?.find((l) => l.id === newTimeReport.id);

                        if (!existingTimeReport || hasChanges(existingTimeReport, newTimeReport)) {
                            await logChangeToBooking(
                                context.currentUser,
                                bookingId,
                                BookingChangelogEntryType.TIMEREPORT,
                            );
                        }

                        res.status(200).json(result);
                    })
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithEntityNotFoundResponse(res);
        }
    },
);

export default handler;
