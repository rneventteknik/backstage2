import { WebClient } from '@slack/web-api';
import { fetchBookingWithEquipmentLists } from './db-access/booking';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { onlyUnique } from './utils';

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

export const startDmGroupWithUsers = async (userSlackIds: string[]): Promise<string> => {
    try {
        const client = new WebClient(process.env.SLACK_BOT_TOKEN);

        const response = await client.conversations.open({
            users: userSlackIds.join(','),
        });

        if (!response?.ok || !response.channel?.id) {
            throw new Error('Failed to open conversation');
        }

        return response.channel.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const sendSlackMessageToUsersRegardingBookings = async (
    message: string,
    bookings: { id: number; name: string }[],
    userSlackIds: string[],
) => {
    const uniqueUserSlackIds = userSlackIds.filter(onlyUnique);
    const bookingList = bookings.map((x) => {
        const bookingUrl = process.env.APPLICATION_BASE_URL + '/bookings/' + x.id;
        return `>- <${bookingUrl}|${x.name}>\n`;
    });

    const formattedMessage = `${message}\n\n>Angående bokningar:\n${bookingList.join('')}`;

    if (!uniqueUserSlackIds || uniqueUserSlackIds.length === 0) {
        throw new Error('Invalid slack channel id');
    }

    const channelId =
        uniqueUserSlackIds.length === 1 ? uniqueUserSlackIds[0] : await startDmGroupWithUsers(uniqueUserSlackIds);

    sendSlackMessage(formattedMessage, channelId);
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
