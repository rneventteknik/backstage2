import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import useSwr from 'swr';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton from 'react-loading-skeleton';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import { EmailThreadResult } from '../../models/misc/EmailThreadResult';
import { getResponseContentOrError } from '../../lib/utils';
import { formatDatetimeForForm, toDatetimeOrUndefined } from '../../lib/datetimeUtils';
import { ViewThreadDetailsModal } from './EmailThreadsCard';

type Props = {
    onSelect: (threadId: string) => void;
};

const EmailThreadSelector: React.FC<Props> = ({ onSelect }: Props) => {
    const [viewThreadId, setViewThreadId] = useState<string | null>(null);
    const { data: emailThreads, error: emailThreadsError } = useSwr('/api/email', (url) =>
        fetch(url).then((response) => getResponseContentOrError<EmailThreadResult[]>(response)),
    );

    if (emailThreadsError) {
        return (
            <Card>
                <Card.Body>
                    <div className="text-danger">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                        Det gick inte att ladda emailtrådar.
                    </div>
                    <div className="text-monospace text-muted mt-2">{emailThreadsError.message}</div>
                </Card.Body>
            </Card>
        );
    }

    if (!emailThreads) {
        return <Skeleton count={5} height={60} className="mb-2" />;
    }

    const EmailThreadSubjectDisplayFn = (thread: EmailThreadResult) => (
        <>
            <div className="mb-1">
                <strong>{thread.subject || '(Inget ämne)'}</strong>
            </div>
            <div className="text-muted">{thread.messages[0].from}</div>
            <div className="text-muted">{thread.snippet}</div>
        </>
    );

    const EmailThreadActionsDisplayFn = (thread: EmailThreadResult) => (
        <>
            <Button
                variant="secondary"
                size="sm"
                className="mr-2"
                onClick={() => setViewThreadId(thread.id)}
            >
                Visa
            </Button>
            <Button
                variant="primary"
                size="sm"
                className="mr-2"
                onClick={() => onSelect(thread.id)}
            >
                Välj
            </Button>
        </>
    );

    const tableSettings: TableConfiguration<EmailThreadResult> = {
        entityTypeDisplayName: 'emailtrådar',
        defaultSortPropertyName: 'lastMessage',
        defaultSortAscending: false,
        hideTableCountControls: false,
        noResultsLabel: 'Inga emailtrådar hittades',
        columns: [
            {
                key: 'subject',
                displayName: 'Ämne',
                getValue: (thread: EmailThreadResult) =>
                    `${thread.subject} ${thread.messages[0].from} ${thread.snippet} `,
                getContentOverride: EmailThreadSubjectDisplayFn,
            },
            {
                key: 'messageCount',
                displayName: 'Meddelanden',
                getValue: (thread: EmailThreadResult) => thread.messageCount.toString(),
                getContentOverride: (thread: EmailThreadResult) => (
                    <>
                        {thread.messageCount} meddelande{thread.messageCount !== 1 ? 'n' : ''}
                    </>
                ),
                columnWidth: 140,
                cellHideSize: 'lg',
            },
            {
                key: 'lastMessage',
                displayName: 'Senaste meddelande',
                getValue: (thread: EmailThreadResult) =>
                    formatDatetimeForForm(toDatetimeOrUndefined(thread.firstMessageDate)),
                getContentOverride: (thread: EmailThreadResult) =>
                    formatDatetimeForForm(toDatetimeOrUndefined(thread.firstMessageDate)),
                columnWidth: 170,
                cellHideSize: 'lg',
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                getContentOverride: EmailThreadActionsDisplayFn,
                disableSort: true,
                columnWidth: 170,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <>
            <Card>
                <TableDisplay entities={emailThreads} configuration={tableSettings} />
            </Card>
            {viewThreadId ? (
                <ViewThreadDetailsModal
                    show={!!viewThreadId}
                    hide={() => setViewThreadId(null)}
                    threadId={viewThreadId}
                />
            ) : null}
        </>
    );
};

export default EmailThreadSelector;
