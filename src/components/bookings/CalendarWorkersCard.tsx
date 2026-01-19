import React, { useState } from 'react';
import { Alert, Button, Card, Dropdown, DropdownButton, Form, ListGroup, Modal } from 'react-bootstrap';
import useSwr from 'swr';
import { getMemberStatusName, getResponseContentOrError } from '../../lib/utils';
import {
    faAngleDown,
    faAngleUp,
    faCalendar,
    faExclamationCircle,
    faExternalLinkAlt,
    faHashtag,
    faMessage,
    faQuestion,
    faUser,
    faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { faUser as faUserRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TableStyleLink from '../utils/TableStyleLink';
import Skeleton from 'react-loading-skeleton';
import { CalendarResult } from '../../models/misc/CalendarResult';
import { MemberStatus } from '../../models/enums/MemberStatus';
import { useNotifications } from '../../lib/useNotifications';
import { getFormattedInterval } from '../../lib/datetimeUtils';

type Props = {
    bookingId: number;
    calendarEventIds: string[];
    onSubmit: (calendarEventIds: string[]) => void;
    readonly?: boolean;
};

const CalendarWorkersCard: React.FC<Props> = ({ bookingId, calendarEventIds, onSubmit, readonly = false }: Props) => {
    const [showContent, setShowContent] = useState(true);
    const [showSelectCalendarEventModal, setShowSelectCalendarEventModal] = useState(false);

    return (
        <>
            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <span className="flex-grow-1 mr-2">Uppskrivna i kalendern</span>
                    {!readonly ? (
                        <Button
                            onClick={() => setShowSelectCalendarEventModal(true)}
                            variant="secondary"
                            className="mr-2"
                            size="sm"
                        >
                            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                            Koppla fler kalenderevent
                        </Button>
                    ) : null}
                    <Button variant="" size="sm" onClick={() => setShowContent((x) => !x)}>
                        <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                    </Button>
                </Card.Header>
                {showContent ? (
                    <ListGroup variant="flush">
                        {calendarEventIds.length <= 0 ? (
                            <ListGroup.Item className="text-center font-italic text-muted">
                                Koppla bokningen till kalenderevent för att se uppskrivna arbetare.
                            </ListGroup.Item>
                        ) :
                            calendarEventIds.map(calendarEventId =>
                                <CalendarSublist
                                    bookingId={bookingId}
                                    calendarEventId={calendarEventId}
                                    onRemove={() => onSubmit(calendarEventIds.filter(id => id != calendarEventId))}
                                    readonly={readonly}
                                />
                            )
                        }
                    </ListGroup>
                ) : null}
            </Card>
            {showSelectCalendarEventModal ? (
                <SelectCalendarEventModal
                    show={showSelectCalendarEventModal}
                    hide={() => setShowSelectCalendarEventModal(false)}
                    onSubmit={(calendarEventId) => onSubmit([...calendarEventIds, calendarEventId])}
                />
            ) : null}
        </>
    );
};

type CalendarSublistProps = {
    bookingId: number;
    calendarEventId: string;
    onRemove: () => void;
    readonly: boolean;
};

const CalendarSublist: React.FC<CalendarSublistProps> = ({
    bookingId,
    calendarEventId,
    onRemove,
    readonly,
}: CalendarSublistProps) => {
    const [showSelectCalendarEventModal, setShowSelectCalendarEventModal] = useState(false);

    const { data, error } = useSwr(`/api/calendar/${calendarEventId}`, (url) =>
        fetch(url).then((response) => getResponseContentOrError<CalendarResult>(response)),
    );

    const { showGeneralSuccessMessage, showGeneralDangerMessage } = useNotifications();

    // Error handling
    //
    if (error) {
        return (
            <div className="p-3">
                <p className="text-danger">
                    <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda kalenderevent.
                </p>
                <p className="text-monospace text-muted mb-0">{error.message}</p>
            </div>
        );
    }

    // Loading skeleton
    //
    if (!data) {
        return <Skeleton height={150} className="mb-3" />;
    }

    const workingUsers = data.workingUsers;

    // Send message to booking workers
    //
    const sendMessageToCalendarWorkers = (startSlackChannel: boolean) => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bookingId: bookingId,
                startSlackChannel: startSlackChannel,
            }),
        };

        fetch('/api/sendMessage/toBookingWorkers', request)
            .then(getResponseContentOrError)
            .then(() => showGeneralSuccessMessage('Meddelandet skickades'))
            .catch((error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Meddelandet kunde inte skickas');
            });
    };

    // Workers list
    //
    return ( // TODO: Better error handling for missing calendar name
        <>
            <Card.Header className="d-flex">
                <span className="flex-grow-1">{data.name || "Kalender event"}</span>
                <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                    {!readonly && workingUsers.length > 0 ? (
                        <>
                            <Dropdown.Item onClick={() => sendMessageToCalendarWorkers(false)}>
                                <FontAwesomeIcon icon={faMessage} className="mr-1 fa-fw" /> Skicka direktmeddelande till
                                de som jobbar
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => sendMessageToCalendarWorkers(true)}>
                                <FontAwesomeIcon icon={faHashtag} className="mr-1 fa-fw" /> Skapa slackkanal med de som
                                jobbar
                            </Dropdown.Item>
                        </>
                    ) : null}
                    <Dropdown.Item href={data?.link} target="_blank">
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1 fa-fw" /> Öppna i Google Calendar
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onRemove}>
                        <FontAwesomeIcon icon={faTrash} className="mr-1 fa-fw" /> Ta bort koppling
                    </Dropdown.Item>
                </DropdownButton>
                {showSelectCalendarEventModal ? (
                    <SelectCalendarEventModal
                        show={showSelectCalendarEventModal}
                        hide={() => setShowSelectCalendarEventModal(false)}
                        onSubmit={onRemove}
                        value={data?.id}
                    />
                ) : null}
            </Card.Header>
            <ListGroup variant="flush">
                {workingUsers.map((user) => (
                    <ListGroup.Item key={user.id}>
                        <div className="mb-1">
                            <FontAwesomeIcon icon={getIcon(user.memberStatus)} className="mr-2" />
                            {user.name !== undefined ? (
                                <TableStyleLink href={`/users/${user.id}`}>{user.name}</TableStyleLink>
                            ) : (
                                user.nameTag
                            )}
                        </div>
                        <div className="text-muted">
                            {user.nameTag}{' '}
                            {user.memberStatus !== undefined ? `/ ${getMemberStatusName(user.memberStatus)}` : null}
                        </div>
                    </ListGroup.Item>
                ))}
                {workingUsers.length === 0 ? (
                    <ListGroup.Item className="text-center font-italic text-muted">
                        Tagga användare i kalendern för att visa dem här.
                    </ListGroup.Item>
                ) : null}
            </ListGroup>
        </>
    );
};

const getIcon = (memberStatus: MemberStatus | undefined) => {
    switch (memberStatus) {
        case MemberStatus.ASP:
            return faUserRegular;
        case undefined:
            return faQuestion;
        default:
            return faUser;
    }
};

type SelectCalendarEventModalProps = {
    show: boolean;
    hide: () => void;
    onSubmit: (calendarEventId: string) => void;
    value?: string;
};

const SelectCalendarEventModal: React.FC<SelectCalendarEventModalProps> = ({
    show,
    hide,
    onSubmit,
    value,
}: SelectCalendarEventModalProps) => {
    const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<string>(value ?? '');

    const { data: bookingsCalendarList, error: bookingsCalendarListError } = useSwr('/api/calendar', (url) =>
        fetch(url)
            .then((response) => getResponseContentOrError<CalendarResult[]>(response))
            .then((calenderResults) =>
                calenderResults.map((calenderResult) => ({
                    ...calenderResult,
                    key: calenderResult.id,
                    label: `${calenderResult.name} (${getFormattedInterval(new Date(calenderResult.start ?? ''), new Date(calenderResult.end ?? ''), true)})`,
                })),
            ),
    );

    // Error handling
    //
    if (bookingsCalendarListError) {
        return (
            <div className="p-3">
                <p className="text-danger">
                    <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda kalenderevent.
                </p>
                <p className="text-monospace text-muted mb-0">{bookingsCalendarListError.message}</p>
            </div>
        );
    }

    // Loading skeleton
    //
    if (!bookingsCalendarList) {
        return (
            <Modal show={show} onHide={hide}>
                <Modal.Header closeButton>
                    <Modal.Title>Välj kalenderevent</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Skeleton count={1} height={40} className="mb-2" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hide}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    const previousCalendarEvent = bookingsCalendarList.find((x) => x.key == value);
    const cannotFindConnectedEvent = value && !previousCalendarEvent;

    return (
        <Modal show={show} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>Välj kalenderevent</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {cannotFindConnectedEvent ? (
                    <Alert variant="warning" className="mb-3">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                        Denna bokning är kopplad till ett okänt kalenderevent som har passerats eller inte längre finns.
                        <p className="text-monospace mt-2 mb-0">Id: {value}</p>
                    </Alert>
                ) : null}
                <Form.Control
                    as="select"
                    value={selectedCalendarEvent}
                    onChange={(e) => setSelectedCalendarEvent(e.target.value)}
                >
                    {cannotFindConnectedEvent ? (
                        <option value={selectedCalendarEvent}>Okänt event ({value})</option>
                    ) : null}
                    <option value="">Ingen koppling till kalenderevent</option>
                    {bookingsCalendarList.map((x) => (
                        <option key={x.id} value={x.key}>
                            {x.label}
                        </option>
                    ))}
                </Form.Control>
                <Form.Text className="text-muted">
                    <a
                        href={bookingsCalendarList.find((x) => x.key == selectedCalendarEvent)?.link}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Visa i Google Calender <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a>
                </Form.Text>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Avbryt
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        hide();
                        onSubmit(selectedCalendarEvent);
                    }}
                >
                    Spara
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CalendarWorkersCard;
