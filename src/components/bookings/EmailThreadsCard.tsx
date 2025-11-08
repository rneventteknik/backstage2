import React, { useState } from 'react';
import { Button, Card, Dropdown, DropdownButton, ListGroup, Modal } from 'react-bootstrap';
import useSwr from 'swr';
import { getResponseContentOrError } from '../../lib/utils';
import {
    faAngleDown,
    faAngleUp,
    faEnvelope,
    faExclamationCircle,
    faPlus,
    faTrash,
    faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton from 'react-loading-skeleton';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import { EmailThreadResult, EmailMessageResult } from '../../models/misc/EmailThreadResult';
import { formatDatetimeForForm, toDatetimeOrUndefined } from '../../lib/datetimeUtils';

type Props = {
    emailThreadIds: string[];
    onSubmit: (emailThreadIds: string[]) => void;
    readonly?: boolean;
};

const EmailThreadsCard: React.FC<Props> = ({ emailThreadIds, onSubmit, readonly = false }: Props) => {
    const [showContent, setShowContent] = useState(true);
    const [showSelectEmailThreadModal, setShowSelectEmailThreadModal] = useState(false);

    // No email threads connected
    if (!emailThreadIds || emailThreadIds.length === 0) {
        return (
            <>
                <Card className="mb-3">
                    <Card.Header className="d-flex">
                        <span className="flex-grow-1">Kopplade emailtrådar</span>
                        {!readonly ? (
                            <Button
                                onClick={() => setShowSelectEmailThreadModal(true)}
                                variant="secondary"
                                className="ml-2"
                                size="sm"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                Lägg till emailtråd
                            </Button>
                        ) : null}
                    </Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="text-center font-italic text-muted">
                            Koppla bokningen till emailtrådar för att se dem här.
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
                {showSelectEmailThreadModal ? (
                    <SelectEmailThreadModal
                        show={showSelectEmailThreadModal}
                        hide={() => setShowSelectEmailThreadModal(false)}
                        onSubmit={(threadId) => onSubmit([...emailThreadIds, threadId])}
                    />
                ) : null}
            </>
        );
    }

    // Email threads list
    return (
        <>
            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <span className="flex-grow-1">Kopplade emailtrådar</span>
                    <Button className="mr-2" variant="" size="sm" onClick={() => setShowContent((x) => !x)}>
                        <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                    </Button>
                    {!readonly ? (
                        <DropdownButton id="dropdown-email-threads" variant="secondary" title="Mer" size="sm">
                            <Dropdown.Item onClick={() => setShowSelectEmailThreadModal(true)}>
                                <FontAwesomeIcon icon={faPlus} className="mr-1 fa-fw" /> Lägg till emailtråd
                            </Dropdown.Item>
                        </DropdownButton>
                    ) : null}
                    {showSelectEmailThreadModal ? (
                        <SelectEmailThreadModal
                            show={showSelectEmailThreadModal}
                            hide={() => setShowSelectEmailThreadModal(false)}
                            onSubmit={(threadId) => onSubmit([...emailThreadIds, threadId])}
                        />
                    ) : null}
                </Card.Header>
                {showContent ? (
                    <ListGroup variant="flush">
                        {emailThreadIds.map((threadId) => (
                            <EmailThreadItem
                                key={threadId}
                                threadId={threadId}
                                onRemove={() => onSubmit(emailThreadIds.filter((id) => id !== threadId))}
                                readonly={readonly}
                            />
                        ))}
                    </ListGroup>
                ) : null}
            </Card>
        </>
    );
};

type EmailThreadItemProps = {
    threadId: string;
    onRemove: () => void;
    readonly: boolean;
};

const EmailThreadItem: React.FC<EmailThreadItemProps> = ({ threadId, onRemove, readonly }: EmailThreadItemProps) => {
    const [showViewThreadModal, setShowViewThreadModal] = useState(false);
    const { data: emailThreadData, error } = useSwr(`/api/email/${threadId}`, (url) =>
        fetch(url).then((response) => getResponseContentOrError<EmailThreadResult>(response)),
    );

    // Error handling
    if (error) {
        return (
            <ListGroup.Item>
                <div className="d-flex align-items-start">
                    <div className="flex-grow-1">
                        <div className="text-danger mb-1">
                            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                            Det gick inte att ladda emailtråden
                        </div>
                        <div className="text-monospace text-muted small">{threadId}</div>
                        <div className="text-muted small">{(error as Error).message}</div>
                        {!readonly ? (
                            <Button variant="danger" size="sm" className="mt-2" onClick={onRemove}>
                                <FontAwesomeIcon icon={faTrash} /> Ta bort kopping
                            </Button>
                        ) : null}
                    </div>
                </div>
            </ListGroup.Item>
        );
    }

    // Loading
    if (!emailThreadData) {
        return (
            <ListGroup.Item>
                <div className="d-flex align-items-start">
                    <div className="flex-grow-1">
                        <Skeleton count={2} />
                    </div>
                </div>
            </ListGroup.Item>
        );
    }

    return (
        <>
            <ListGroup.Item>
                <div className="d-flex align-items-start">
                    <div className="flex-grow-1" role="button" onClick={() => setShowViewThreadModal(true)}>
                        <div className="mb-1">
                            {emailThreadData.subject || '(Inget ämne)'}
                        </div>
                        <div className="text-muted">
                            {emailThreadData.messageCount} meddelande{emailThreadData.messageCount !== 1 ? 'n' : ''}
                        </div>
                    </div>
                    {!readonly ? (
                        <DropdownButton id="dropdown-email-threads" variant="secondary" title="Mer" size="sm" className='ml-3'>
                            <Dropdown.Item variant="link" size="sm" className="text-danger" onClick={onRemove}>
                                <FontAwesomeIcon icon={faTrash} className='mr-2' /> Ta bort kopping
                            </Dropdown.Item>
                        </DropdownButton>
                    ) : null}
                </div>
            </ListGroup.Item>
            {showViewThreadModal ? (
                <ViewThreadDetailsModal
                    show={showViewThreadModal}
                    hide={() => setShowViewThreadModal(false)}
                    threadId={threadId}
                />
            ) : null}
        </>
    );
};

type SelectEmailThreadModalProps = {
    show: boolean;
    hide: () => void;
    onSubmit: (threadId: string) => void;
};

const SelectEmailThreadModal: React.FC<SelectEmailThreadModalProps> = ({
    show,
    hide,
    onSubmit,
}: SelectEmailThreadModalProps) => {
    const [viewThreadId, setViewThreadId] = useState<string | null>(null);
    const { data: emailThreads, error: emailThreadsError } = useSwr('/api/email', (url) =>
        fetch(url).then((response) => getResponseContentOrError<EmailThreadResult[]>(response)),
    );

    // Error handling
    if (emailThreadsError) {
        return (
            <Modal show={show} onHide={hide} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Välj emailtråd</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <Card.Body>
                            <div className="text-danger">
                                <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                                Det gick inte att ladda emailtrådar.
                            </div>
                            <div className="text-monospace text-muted mt-2">{emailThreadsError.message}</div>
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide}>
                        Stäng
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    // Loading
    if (!emailThreads) {
        return (
            <Modal show={show} onHide={hide} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Välj emailtråd</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Skeleton count={5} height={60} className="mb-2" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    // Display functions
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
                onClick={() => {
                    setViewThreadId(thread.id);
                }}
            >
                Visa
            </Button>
            <Button
                variant="primary"
                size="sm"
                className="mr-2"
                onClick={() => {
                    hide();
                    onSubmit(thread.id);
                }}
            >
                Välj
            </Button>
        </>
    );

    // Table settings
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
                getValue: (thread: EmailThreadResult) => `${thread.subject} ${thread.messages[0].from} ${thread.snippet} `,
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
                getValue: (thread: EmailThreadResult) => formatDatetimeForForm(toDatetimeOrUndefined(thread.firstMessageDate)),
                getContentOverride: (thread: EmailThreadResult) => formatDatetimeForForm(toDatetimeOrUndefined(thread.firstMessageDate)),
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
            <Modal show={show} onHide={hide} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Välj emailtråd</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <TableDisplay entities={emailThreads} configuration={tableSettings} />
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
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

type ViewThreadDetailsModalProps = {
    show: boolean;
    hide: () => void;
    threadId: string;
};

const ViewThreadDetailsModal: React.FC<ViewThreadDetailsModalProps> = ({
    show,
    hide,
    threadId,
}: ViewThreadDetailsModalProps) => {
    const { data: thread, error } = useSwr(threadId ? `/api/email/${threadId}` : null, (url) =>
        fetch(url).then((response) => getResponseContentOrError<EmailThreadResult>(response)),
    );

    // Error handling
    if (error) {
        return (
            <Modal show={show} onHide={hide} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Emailtråd</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <Card.Body>
                            <div className="text-danger">
                                <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                                Det gick inte att ladda emailtråden.
                            </div>
                            <div className="text-monospace text-muted mt-2">{error.message}</div>
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide}>
                        Stäng
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    // Loading
    if (!thread) {
        return (
            <Modal show={show} onHide={hide} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Emailtråd</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Skeleton count={5} height={100} className="mb-3" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide}>
                        Stäng
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={hide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    {thread.subject || '(Inget ämne)'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3 text-muted">
                    {thread.messageCount} meddelande{thread.messageCount !== 1 ? 'n' : ''} i tråden
                </div>
                <ListGroup>
                    {thread.messages.map((message: EmailMessageResult, index: number) => (
                        <ListGroup.Item key={message.id} className="mb-3">
                            <div className="mb-2">
                                <strong>#{index + 1}</strong>
                                {message.subject && message.subject !== thread.subject ? (
                                    <span className="ml-2">{message.subject}</span>
                                ) : null}
                            </div>
                            <div className="mb-2">
                                <div className="text-muted small">
                                    <strong>Från:</strong> {message.from || '(Okänd avsändare)'}
                                </div>
                                <div className="text-muted small">
                                    <strong>Till:</strong> {message.to || '(Okänd mottagare)'}
                                </div>
                                <div className="text-muted small">
                                    <strong>Datum:</strong>{' '}
                                    {message.date
                                        ? formatDatetimeForForm(toDatetimeOrUndefined(message.date))
                                        : '(Okänt datum)'}
                                </div>
                            </div>
                            {message.body ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: message.body }}
                                />
                            ) : null}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Stäng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EmailThreadsCard;
