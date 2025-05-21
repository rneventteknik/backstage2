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
    calendarEventId: string;
    onSubmit: (calendarEventId: string) => void;
    readonly?: boolean;
};

const CalendarWorkersCard: React.FC<Props> = ({ bookingId, calendarEventId, onSubmit, readonly = false }: Props) => {
    const [showSelectCalendarEventModal, setShowSelectCalendarEventModal] = useState(false);
    // No connection to calendar event
    //
    if (calendarEventId === null || calendarEventId === '') {
        return (
            <>
                <Card className="mb-3">
                    <Card.Header className="d-flex">
                        <span className="flex-grow-1">Uppskrivna i kalendern</span>
                        {!readonly ? (
                            <Button
                                onClick={() => setShowSelectCalendarEventModal(true)}
                                variant="secondary"
                                className="ml-2"
                                size="sm"
                            >
                                <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                                Välj kalenderevent
                            </Button>
                        ) : null}
                    </Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="text-center font-italic text-muted">
                            Koppla bokningen till ett kalenderevent för att se uppskrivna arbetare.
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
                {showSelectCalendarEventModal ? (
                    <SelectCalendarEventModal
                        show={showSelectCalendarEventModal}
                        hide={() => setShowSelectCalendarEventModal(false)}
                        onSubmit={onSubmit}
                    />
                ) : null}
            </>
        );
    }
    // Workers list
    //
    return (
        <>
            <Card className="mb-3">
                <CalendarWorkersCardWithCalendarConnection
                    bookingId={bookingId}
                    calendarEventId={calendarEventId}
                    onSubmit={onSubmit}
                    readonly={readonly}
                />
            </Card>
        </>
    );
};

type CalendarWorkersCardWithCalendarConnectionProps = {
    bookingId: number;
    calendarEventId: string;
    onSubmit: (calendarEventId: string) => void;
    readonly: boolean;
};

const CalendarWorkersCardWithCalendarConnection: React.FC<CalendarWorkersCardWithCalendarConnectionProps> = ({
    bookingId,
    calendarEventId,
    onSubmit,
    readonly,
}: CalendarWorkersCardWithCalendarConnectionProps) => {
    const [showContent, setShowContent] = useState(true);
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
    return (
        <>
            <Card.Header className="d-flex">
                <span className="flex-grow-1">Uppskrivna i kalendern</span>
                <Button className="mr-2" variant="" size="sm" onClick={() => setShowContent((x) => !x)}>
                    <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                </Button>
                <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                    {!readonly && workingUsers.length > 0 ? (
                        <>
                            <Dropdown.Item onClick={() => sendMessageToCalendarWorkers(false)}>
                                <FontAwesomeIcon icon={faMessage} className="mr-1 fa-fw" /> Skicka direktmeddelande
                                till de som jobbar
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => sendMessageToCalendarWorkers(true)}>
                                <FontAwesomeIcon icon={faHashtag} className="mr-1 fa-fw" /> Skapa slackkanal med de
                                som jobbar
                            </Dropdown.Item>
                        </>
                    ) : null}
                    {!readonly ? (
                        <>
                            <Dropdown.Item onClick={() => setShowSelectCalendarEventModal(true)}>
                                <FontAwesomeIcon icon={faCalendar} className="mr-1 fa-fw" /> Redigara koppling till
                                kalenderevent
                            </Dropdown.Item>
                            <Dropdown.Divider />
                        </>
                    ) : null}
                    <Dropdown.Item href={data?.link} target="_blank">
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1 fa-fw" /> Öppna i Google Calendar
                    </Dropdown.Item>
                </DropdownButton>
                {showSelectCalendarEventModal ? (
                    <SelectCalendarEventModal
                        show={showSelectCalendarEventModal}
                        hide={() => setShowSelectCalendarEventModal(false)}
                        onSubmit={onSubmit}
                        value={data?.id}
                    />
                ) : null}
            </Card.Header>
            {showContent ? (
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
            ) : null}
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
                        Denna bokning är kopplad till ett okänt kalenderevent som har passerat eller tagits inte längre
                        finns.
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
