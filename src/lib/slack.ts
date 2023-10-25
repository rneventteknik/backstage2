import { WebClient } from '@slack/web-api';
import { fetchBookingWithEquipmentLists } from './db-access/booking';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';

export const sendSlackMessage = async (message: string, channelId: string) => {
    const client = new WebClient(process.env.SLACK_BOT_TOKEN);

    try {
        await client.chat.postMessage({
            channel: channelId,
            text: message,
        });
    } catch (error) {
        console.error(error);
    }
};

export const sendSlackMessageForBooking = async (
    message: string,
    bookingId: number,
    bookingName: string,
    channelId: string | null = null,
    heading = '',
) => {
    const prefix = heading.length > 0 ? `*${heading}*\n` : '';
    const bookingUrl = process.env.APPLICATION_BASE_URL + '/bookings/' + bookingId;
    const formattedMessage = `${prefix}<${bookingUrl}|${bookingName}> - ${message}`;

    const slackChannelId = channelId ?? process.env.SLACK_CHANNEL_ID;

    if (!slackChannelId) {
        throw new Error('Invalid slack channel id');
    }

    sendSlackMessage(formattedMessage, slackChannelId);
};

// Note: The last parameter here is not the user to send to, is the user NOT to send to (since we do not want to send DMs to the user triggering the action, even if they own the booking).
export const sendSlackDMForBooking = async (
    message: string,
    bookingId: number,
    bookingName: string,
    currentUser: CurrentUserInfo,
) => {
    const booking = await fetchBookingWithEquipmentLists(bookingId);
    const ownerUserSlackId = booking.ownerUser.slackId;

    if (!ownerUserSlackId) {
        return;
    }

    // Only send any message if the current user isnt the owner
    if (booking.ownerUser.id === currentUser.userId) {
        return;
    }

    sendSlackMessageForBooking(
        message,
        bookingId,
        bookingName,
        ownerUserSlackId,
        'En bokning du är ansvarig för har uppdaterats',
    );
};
