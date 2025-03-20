import React, { useState } from 'react';
import { Button, Card, Dropdown, DropdownButton, ListGroup } from 'react-bootstrap';
import useSwr from 'swr';
import { getMemberStatusName, getResponseContentOrError } from '../../lib/utils';
import {
    faAngleDown,
    faAngleUp,
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

type Props = {
    bookingId: number;
    calendarEventId: string;
    readonly?: boolean;
};

const CalendarWorkersCard: React.FC<Props> = ({ bookingId, calendarEventId, readonly = false }: Props) => {
    // No connection to calendar event
    //
    if (calendarEventId === null || calendarEventId === '') {
        return (
            <>
                <Card className="mb-3">
                    <Card.Header className="d-flex">
                        <span className="flex-grow-1">Uppskrivna i kalendern</span>
                    </Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="text-center font-italic text-muted">
                            Koppla bokningen till ett kalenderevent för att se uppskrivna arbetare.
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
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
                    readonly={readonly}
                />
            </Card>
        </>
    );
};

type FilesCardListProps = {
    bookingId: number;
    calendarEventId: string;
    readonly: boolean;
};

const CalendarWorkersCardWithCalendarConnection: React.FC<FilesCardListProps> = ({
    bookingId,
    calendarEventId,
    readonly,
}: FilesCardListProps) => {
    const [showContent, setShowContent] = useState(true);

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

    // Files list
    //
    return (
        <>
            <Card.Header className="d-flex">
                <span className="flex-grow-1">Uppskrivna i kalendern</span>
                <Button className="mr-2" variant="" size="sm" onClick={() => setShowContent((x) => !x)}>
                    <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                </Button>
                {!readonly ? (
                    <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                        {!readonly ? (
                            <>
                                <Dropdown.Item onClick={() => sendMessageToCalendarWorkers(false)}>
                                    <FontAwesomeIcon icon={faMessage} className="mr-1 fa-fw" /> Skicka direktmeddelande
                                    till de som jobbar
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => sendMessageToCalendarWorkers(true)}>
                                    <FontAwesomeIcon icon={faHashtag} className="mr-1 fa-fw" /> Skapa slackkanal med de
                                    som jobbar
                                </Dropdown.Item>
                                <Dropdown.Divider />
                            </>
                        ) : null}
                        <Dropdown.Item href={data?.link} target="_blank">
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1 fa-fw" /> Öppna i Google Calendar
                        </Dropdown.Item>
                    </DropdownButton>
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

export default CalendarWorkersCard;
