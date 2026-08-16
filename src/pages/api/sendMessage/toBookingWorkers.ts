import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidDataResponse } from '../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { fetchUser } from '../../../lib/db-access';
import { notEmpty, onlyUnique } from '../../../lib/utils';
import { sendMessageToUsersForBooking } from '../../../lib/slack';
import { getCalendarEvent } from '../../../lib/calenderUtils';
import { toBooking } from '../../../lib/mappers/booking';
import { fetchBookingWithUser } from '../../../lib/db-access/booking';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.body.bookingId);
        const startSlackChannel = req.body.startSlackChannel === true;

        if (isNaN(bookingId)) {
            respondWithInvalidDataResponse(res);
            return;
        }

        if (!context.currentUser.userId) {
            throw new Error('User not logged in');
        }

        try {
            const currentUser = await fetchUser(context.currentUser.userId);
            const booking = await fetchBookingWithUser(bookingId).then(toBooking);

            if (!booking.calendarEvents || booking.calendarEvents.length === 0) {
                respondWithInvalidDataResponse(res);
                return;
            }

            const calendarEvents = await Promise.all(
                booking.calendarEvents.map((e) => getCalendarEvent(e.calendarEventId)),
            );

            const bookingWorkersSlackIds = calendarEvents.flatMap((e) => e.workingUsers?.map((user) => user.slackId) ?? []);
            const calendarEventLinks = calendarEvents
                .filter((e) => notEmpty(e.link))
                .map((e) => ({ link: e.link!, name: e.name }));
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

            await sendMessageToUsersForBooking(booking, startSlackChannel, slackIds, calendarEventLinks);

            res.status(200).json(true);
        } catch (error) {
            respondWithCustomErrorMessage(res, (error as { message: string }).message);
        }
    },
);

export default handler;
