export interface EmailThreadResult {
    id: string;
    messages: EmailMessageResult[];
    subject?: string;
    snippet?: string;
    messageCount: number;
    firstMessageDate?: string;
    lastMessageDate?: string;
}

export interface EmailMessageResult {
    id: string;
    threadId?: string;
    subject?: string;
    from?: string;
    to?: string;
    date?: string;
    snippet?: string;
    body?: string;
}
