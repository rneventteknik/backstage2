import { gmail_v1, google } from 'googleapis';

interface EmailMessage {
    id: string;
    threadId?: string;
    subject?: string;
    from?: string;
    to?: string;
    date?: string;
    snippet?: string;
    body?: string;
}

interface EmailThread {
    id: string;
    messages: EmailMessage[];
    subject?: string;
    snippet?: string;
    link: string;
    messageCount: number;
}

interface EmailHeaders {
    subject?: string;
    from?: string;
    to?: string;
    date?: string;
    [key: string]: string | undefined;
}

const getEmailClient = () => {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        console.error('Missing Gmail credentials. Please set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN');
        return null;
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000');

    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
};

const parseEmailHeaders = (headers?: gmail_v1.Schema$MessagePartHeader[]): EmailHeaders => {
    if (!headers) return {};

    return headers.reduce((acc, header) => {
        if (header.name) {
            acc[header.name.toLowerCase()] = header.value || '';
        }
        return acc;
    }, {} as EmailHeaders);
};

const getEmailBody = (payload?: gmail_v1.Schema$MessagePart): string | undefined => {
    if (!payload) return undefined;

    // Check if the body data is directly in the payload
    if (payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    // If it's a multipart message, recursively check parts
    if (!payload.parts || payload.parts.length === 0) {
        return undefined;
    }

    // Find text/html part
    const htmlPart = payload.parts.find((part) => part.mimeType === 'text/html' && part.body?.data);
    if (htmlPart?.body?.data) {
        return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
    }

    // Find text/plain part
    const textPart = payload.parts.find((part) => part.mimeType === 'text/plain' && part.body?.data);
    if (textPart?.body?.data) {
        return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }

    // Recursively check nested parts
    const nestedBodies = payload.parts
        .filter((part) => part.parts)
        .map((part) => getEmailBody(part))
        .filter((body) => body !== undefined);

    return nestedBodies[0];
};

const mapEmailMessage = async (message: gmail_v1.Schema$Message): Promise<EmailMessage> => {
    const headers = parseEmailHeaders(message.payload?.headers);
    const threadId = message.threadId ?? '';
    const messageId = message.id as string;

    return {
        id: messageId,
        threadId: threadId,
        subject: headers['subject'],
        from: headers['from'],
        to: headers['to'],
        date: headers['date'],
        snippet: message.snippet || undefined,
        body: getEmailBody(message.payload),
    };
};

const mapEmailResponse = async (messages: gmail_v1.Schema$Message[]): Promise<EmailMessage[] | null> => {
    if (!messages || messages.length === 0) {
        return null;
    }

    return Promise.all(messages.map((x) => mapEmailMessage(x)));
};

export const getEmails = async () => {
    const gmail = getEmailClient();

    if (!gmail) {
        return [];
    }

    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 250,
        });

        if (!response.data.messages) {
            return null;
        }

        // Fetch full message details for each email
        const messagesWithDetails = await Promise.all(
            response.data.messages.map(async (message: gmail_v1.Schema$Message) => {
                const fullMessage = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                    format: 'full',
                });
                return fullMessage.data;
            }),
        );

        return mapEmailResponse(messagesWithDetails);
    } catch (e) {
        console.error('Error fetching thread:', e);
        return null;
    }
};

export const getEmailThread = async (threadId: string): Promise<EmailThread | null> => {
    const gmail = getEmailClient();

    if (!gmail) {
        return null;
    }

    try {
        const thread = await gmail.users.threads.get({
            userId: 'me',
            id: threadId,
            format: 'full',
        });

        if (!thread.data || !thread.data.messages) {
            return null;
        }

        const messages = await Promise.all(thread.data.messages.map((message) => mapEmailMessage(message)));

        // Get subject from the first message
        const firstMessage = messages[0];

        return {
            id: thread.data.id as string,
            messages,
            subject: firstMessage?.subject,
            snippet: thread.data.snippet || undefined,
            link: `https://mail.google.com/mail/u/0/#inbox/${threadId}`,
            messageCount: messages.length,
        };
    } catch (e) {
        console.error('Error fetching thread:', e);
        return null;
    }
};
