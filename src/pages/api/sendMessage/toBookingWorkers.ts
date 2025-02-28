import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidDataResponse } from '../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { fetchUser } from '../../../lib/db-access';
import { notEmpty, onlyUnique } from '../../../lib/utils';
import { startSlackChannelWithUsersForBooking } from '../../../lib/slack';
import { getCalendarEvent } from '../../../lib/calenderUtils';
import { toBooking } from '../../../lib/mappers/booking';
import { fetchBookingWithEquipmentLists } from '../../../lib/db-access/booking';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.body.bookingId);

        if (isNaN(bookingId)) {
            respondWithInvalidDataResponse(res);
            return;
        }

        if (!context.currentUser.userId) {
            throw new Error('User not logged in');
        }

        try {
            const currentUser = await fetchUser(context.currentUser.userId);
            const booking = await fetchBookingWithEquipmentLists(bookingId).then(toBooking);

            if (!booking.calendarBookingId || booking.calendarBookingId.length === 0) {
                respondWithInvalidDataResponse(res);
                return;
            }

            const calenderEvent = await getCalendarEvent(booking.calendarBookingId);
            const bookingWorkersSlackIds = calenderEvent.workingUsers?.map((user) => user.slackId);
            const currentUserSlackId = currentUser?.slackId;
            const bookingOwnerSlackId = booking.ownerUser?.slackId;

            const slackIds = [...bookingWorkersSlackIds, currentUserSlackId, bookingOwnerSlackId]
                .filter((x) => !!x && x?.length > 0)
                .filter(notEmpty)
                .filter(onlyUnique);

            if (slackIds.length === 0) {
                respondWithInvalidDataResponse(res);
                return;
            }

            await startSlackChannelWithUsersForBooking(booking, slackIds);

            res.status(200).json(true);
        } catch (error) {
            respondWithCustomErrorMessage(res, (error as { message: string }).message);
        }
    },
);

export default handler;
