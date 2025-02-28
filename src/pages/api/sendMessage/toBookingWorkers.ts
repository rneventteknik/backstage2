import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidDataResponse } from '../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { fetchBooking, fetchUser } from '../../../lib/db-access';
import { notEmpty, onlyUnique } from '../../../lib/utils';
import { sendSlackMessageToUsersRegardingBookings } from '../../../lib/slack';
import { getCalendarEvent } from '../../../lib/calenderUtils';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.body.bookingId);
        const message: string = req.body.message;

        if (isNaN(bookingId)) {
            respondWithInvalidDataResponse(res);
            return;
        }

        if (!message || message.length === 0) {
            respondWithInvalidDataResponse(res);
            return;
        }

        if (!context.currentUser.userId) {
            throw new Error('User not logged in');
        }

        try {
            const currentUser = await fetchUser(context.currentUser.userId);

            const booking = await fetchBooking(bookingId);

            if (!booking.calendarBookingId || booking.calendarBookingId.length === 0) {
                respondWithInvalidDataResponse(res);
                return;
            }

            const calenderEvent = await getCalendarEvent(booking.calendarBookingId);

            const currentUserSlackId = currentUser?.slackId;
            const bookingOwnerSlackId = booking.ownerUser?.slackId;
            const bookingWorkersSlackIds = calenderEvent.workingUsers?.map((user) => user.slackId);

            const slackIds = [currentUserSlackId, bookingOwnerSlackId, ...bookingWorkersSlackIds]
                .filter(notEmpty)
                .filter(onlyUnique);

            if (slackIds.length <= 1) {
                respondWithInvalidDataResponse(res);
                return;
            }

            await sendSlackMessageToUsersRegardingBookings(message, [booking], slackIds);

            res.status(200).json(true);
        } catch (error) {
            respondWithCustomErrorMessage(res, (error as { message: string }).message);
        }
    },
);

export default handler;
