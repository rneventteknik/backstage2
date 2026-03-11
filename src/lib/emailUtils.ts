import { gmail_v1, google } from 'googleapis';
import { EmailThreadResult, EmailMessageResult, EmailAttachment } from '../models/misc/EmailThreadResult';

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
        console.error(
            'Missing Gmail credentials. Please set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and GMAIL_REFRESH_TOKEN',
        );
        return null;
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');

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

const getAttachments = (payload?: gmail_v1.Schema$MessagePart): EmailAttachment[] => {
    if (!payload) return [];

    const attachments: EmailAttachment[] = [];

    const collectAttachments = (parts?: gmail_v1.Schema$MessagePart[] | undefined) => {
        if (!parts) return;
        for (const part of parts) {
            if (part.filename && part.body?.attachmentId) {
                attachments.push({
                    filename: part.filename,
                    mimeType: part.mimeType || 'application/octet-stream',
                    attachmentId: part.body.attachmentId,
                });
            }
            if (part.parts) {
                collectAttachments(part.parts as gmail_v1.Schema$MessagePart[]);
            }
        }
    };

    collectAttachments(payload.parts as gmail_v1.Schema$MessagePart[] | undefined);
    return attachments;
};

const mapEmailMessage = async (message: gmail_v1.Schema$Message): Promise<EmailMessageResult> => {
    const headers = parseEmailHeaders(message.payload?.headers);
    const threadId = message.threadId ?? '';
    const messageId = message.id as string;
    const attachments = getAttachments(message.payload);

    return {
        id: messageId,
        threadId: threadId,
        subject: headers['subject'],
        from: headers['from'],
        to: headers['to'],
        date: headers['date'],
        snippet: message.snippet || undefined,
        body: getEmailBody(message.payload),
        attachments: attachments.length > 0 ? attachments : undefined,
    };
};

export const getEmailThreads = async (): Promise<EmailThreadResult[] | null> => {
    const gmail = getEmailClient();

    if (!gmail) {
        return [];
    }

    const response = await gmail.users.threads.list({
        userId: 'me',
        maxResults: 100,
    });

    if (!response.data.threads) {
        return [];
    }

    // Fetch full thread details for each thread
    const threadsWithDetails = await Promise.all(
        response.data.threads.map(async (thread) => {
            const fullThread = await gmail.users.threads.get({
                userId: 'me',
                id: thread.id!,
                format: 'full',
            });

            if (!fullThread.data || !fullThread.data.messages) {
                return null;
            }

            const messages = await Promise.all(fullThread.data.messages.map((message) => mapEmailMessage(message)));

            const firstMessage = messages[0];
            const lastMessage = messages[messages.length - 1];

            return {
                id: fullThread.data.id as string,
                messages,
                subject: firstMessage?.subject,
                snippet: fullThread.data.snippet || firstMessage?.snippet || undefined,
                messageCount: messages.length,
                firstMessageDate: firstMessage?.date,
                lastMessageDate: lastMessage?.date,
            };
        }),
    );

    return threadsWithDetails.filter((thread) => thread !== null) as EmailThreadResult[];
};

export const getEmailAttachment = async (messageId: string, attachmentId: string): Promise<string | null> => {
    const gmail = getEmailClient();

    if (!gmail) {
        return null;
    }

    const response = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: attachmentId,
    });

    if (!response.data?.data) {
        return null;
    }

    // Gmail API returns URL-safe base64, decode it
    return Buffer.from(response.data.data, 'base64').toString('utf-8');
};

export const getEmailThread = async (threadId: string): Promise<EmailThreadResult | null> => {
    const gmail = getEmailClient();

    if (!gmail) {
        return null;
    }

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
    const lastMessage = messages[messages.length - 1];

    return {
        id: thread.data.id as string,
        messages,
        subject: firstMessage?.subject,
        snippet: thread.data.snippet || firstMessage?.snippet || undefined,
        messageCount: messages.length,
        firstMessageDate: firstMessage?.date,
        lastMessageDate: lastMessage?.date,
    };
};
