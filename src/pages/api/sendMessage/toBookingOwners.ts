import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidDataResponse } from '../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { fetchBookings, fetchUser } from '../../../lib/db-access';
import { onlyUniqueById } from '../../../lib/utils';
import { toUser } from '../../../lib/mappers/user';
import { sendSlackMessageToUsersRegardingBookings } from '../../../lib/slack';
import { logMessageSentToBookingOwner } from '../../../lib/changelogUtils';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingIds: number[] = req.body.bookingIds;
        const message: string = req.body.message;

        if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
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

            const bookings = (await fetchBookings()).filter((x) => bookingIds.includes(x.id));
            const recipients = bookings
                .map((x) => x.ownerUser!)
                .map((x) => toUser(x))
                .filter(onlyUniqueById)
                .filter((x) => x.slackId);

            await Promise.all(
                recipients.map((recipient) => {
                    const slackIds = !!currentUser?.slackId
                        ? [recipient.slackId, currentUser.slackId]
                        : [recipient.slackId];
                    const bookingsForRecipient = bookings.filter((x) => x.ownerUser!.id === recipient.id);

                    return sendSlackMessageToUsersRegardingBookings(message, bookingsForRecipient, slackIds);
                }),
            );

            await Promise.all(
                bookings.map((booking) => {
                    logMessageSentToBookingOwner(context.currentUser, booking.id, booking.ownerUser.name);
                }),
            );

            res.status(200).json(true);
        } catch (error) {
            respondWithCustomErrorMessage(res, (error as { message: string }).message);
        }
    },
);

export default handler;
