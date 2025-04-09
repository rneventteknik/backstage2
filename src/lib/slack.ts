import { WebClient } from '@slack/web-api';
import { fetchBookingWithEquipmentLists } from './db-access/booking';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { onlyUnique } from './utils';
import { Booking, BookingViewModel } from '../models/interfaces';
import { formatDateForForm, toBookingViewModel } from './datetimeUtils';
import { getDriveLink } from './db-access/utils';

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

export const startChannelIfNotExists = async (channelName: string): Promise<string> => {
    try {
        const client = new WebClient(process.env.SLACK_BOT_TOKEN);

        // First check if channel already exists
        //
        const existingChannelsResponse = await client.conversations.list({
            types: 'public_channel,private_channel',
        });
        if (!existingChannelsResponse.ok || !existingChannelsResponse.channels) {
            throw new Error('Failed to fetch channels');
        }

        const existingChannel = existingChannelsResponse.channels.find((x) => x.name === channelName);
        if (existingChannel && existingChannel.id) {
            return existingChannel.id;
        }

        // If not, create a new one
        //
        const createChannelResponse = await client.conversations.create({
            name: channelName,
        });

        if (!createChannelResponse?.ok || !createChannelResponse.channel?.id) {
            throw new Error('Failed to open conversation');
        }

        return createChannelResponse.channel.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const inviteUsersToChannel = async (userSlackIds: string[], channelId: string): Promise<void> => {
    try {
        const client = new WebClient(process.env.SLACK_BOT_TOKEN);

        // First check if users is already in channel
        //
        const membersResponse = await client.conversations.members({ channel: channelId });

        if (!membersResponse.ok || !membersResponse.members) {
            throw new Error('Failed to retrieve channel members.');
        }

        const newMembers = userSlackIds.filter((x) => !membersResponse.members?.includes(x));

        if (newMembers.length === 0) {
            return;
        }

        // Invite new members
        //
        const inviteResults = await Promise.allSettled(
            newMembers.map((newMember) =>
                client.conversations.invite({
                    channel: channelId,
                    users: newMember,
                }),
            ),
        );

        if (inviteResults.every((x) => x.status === 'rejected')) {
            throw Error('No invite requests succeeded');
        }

        return;
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

export const sendMessageToUsersForBooking = async (
    booking: Booking,
    startSlackChannel: boolean,
    userSlackIds: string[],
    calendarLink: string | undefined = undefined,
) => {
    const uniqueUserSlackIds = userSlackIds.filter(onlyUnique);
    const bookingViewModel = toBookingViewModel(booking);

    let formattedMessage = `*${booking.name}*\n${bookingViewModel.displayUsageInterval}\nDenna ${startSlackChannel ? "kanal" : "grupp"} har skapats av Backstage2. Här kan ni diskutera bokningen och dela viktig information.\n\nBokningslänkar:\n<${process.env.APPLICATION_BASE_URL}/bookings/${booking.id}|:better-rn: Backstage2-bokning>`;

    if (booking.driveFolderId) {
        const driveLink = await getDriveLink(booking.driveFolderId);
        formattedMessage += `\n<${driveLink}|:google-drive: Google Drive-mapp>`;
    }

    if (calendarLink) {
        formattedMessage += `\n<${calendarLink}|:calendar: Google Calendar-event>`;
    }

    formattedMessage += "\n\nHa ett trevligt gigg! :dancing_penguin:"

    if (startSlackChannel) {
        const channelName = getChannelNameForBooking(bookingViewModel);
        const channelId = await startChannelIfNotExists(channelName);
        // If all slackIDs for the users we trie to invite are single channel guests or invalid,
        // the channel will be created but no users invited.
        await inviteUsersToChannel(uniqueUserSlackIds, channelId);
        await sendSlackMessage(formattedMessage, channelId);
    } else {
        const channelId = await startDmGroupWithUsers(uniqueUserSlackIds);
        await sendSlackMessage(formattedMessage, channelId);
    }
};

const getChannelNameForBooking = (bookingViewModel: BookingViewModel): string => {
    const prefix = 'gigg-';
    const suffix = `-${formatDateForForm(bookingViewModel.usageStartDatetime)}`;

    const contentMaxLength = 80 - prefix.length - suffix.length;

    const formattedBookingName = bookingViewModel.name
        .toLocaleLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zåäöA-ZÅÄÖ0-9\-]/g, '')
        .substring(0, contentMaxLength);

    return `${prefix}${formattedBookingName}${suffix}`;
};
