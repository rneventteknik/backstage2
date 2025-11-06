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
    link?: string;
}

interface EmailHeaders {
    subject?: string;
    from?: string;
    to?: string;
    date?: string;
    [key: string]: string | undefined;
}

const getEmailClient = () => {
    const credentialsString = process.env.EMAIL_CREDENTIALS;
    
    if (!credentialsString) {
        throw new Error('EMAIL_CREDENTIALS environment variable is not set');
    }

    let credentials;
    try {
        credentials = JSON.parse(credentialsString);
    } catch (error) {
        throw new Error('EMAIL_CREDENTIALS is not valid JSON');
    }

    // Handle both formats: direct credentials or nested under 'web' or 'installed'
    const clientConfig = credentials.web || credentials.installed || credentials;
    
    const clientId = clientConfig.client_id;
    const clientSecret = clientConfig.client_secret;
    const refreshToken = credentials.refresh_token;

    if (!clientId || !clientSecret) {
        throw new Error('EMAIL_CREDENTIALS is missing client_id or client_secret');
    }

    if (!refreshToken) {
        throw new Error('EMAIL_CREDENTIALS is missing refresh_token. You need to add the refresh_token to your credentials JSON.');
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        "http://localhost:3000"
    );

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

const mapEmailMessage = async (
    message: gmail_v1.Schema$Message
): Promise<EmailMessage> => {
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
        body: message.payload?.body?.data 
            ? Buffer.from(message.payload.body.data, 'base64').toString('utf-8')
            : undefined,
        link: `https://mail.google.com/mail/u/0/#inbox/${threadId}`,
    };
};

const mapEmailResponse = async (
    messages: gmail_v1.Schema$Message[]
): Promise<EmailMessage[] | null> => {
    if (!messages || messages.length === 0) {
        return null;
    }

    return Promise.all(messages.map((x) => mapEmailMessage(x)));
};

export const getEmails = async () => {
    const gmail = getEmailClient();
                console.log('TESTB')


    try {

    
    const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 135,
        q: 'is:unread', // Query to filter emails
    });
    
    console.log(response)

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
        })
    );

    return mapEmailResponse(messagesWithDetails);
    }
    catch(e) {
        console.log(e)
    }
};
