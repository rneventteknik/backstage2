import { WebClient } from '@slack/web-api';

export const sendSlackMessage = async (message: string) => {
    const client = new WebClient(process.env.SLACK_BOT_TOKEN);
    const channelId = process.env.SLACK_CHANNEL_ID;

    if (!channelId) {
        throw new Error('Invalid slack channel id');
    }

    try {
        await client.chat.postMessage({
            channel: channelId,
            text: message,
        });
    } catch (error) {
        console.error(error);
    }
};

export const sendSlackMessageForBooking = async (message: string, bookingId: number, bookingName: string) => {
    const bookingUrl = process.env.NEXT_PUBLIC_BACKSTAGE2_BASE_URL + '/bookings/' + bookingId;
    const formattedMessage = `<${bookingUrl}|${bookingName}> - ${message}`;

    sendSlackMessage(formattedMessage);
};
