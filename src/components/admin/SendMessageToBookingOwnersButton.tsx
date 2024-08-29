import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { Button, Card, Form, Modal, OverlayTrigger, Tab, Tooltip } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { faEnvelope, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdminBookingList from './AdminBookingList';
import { formatTime, toBookingViewModel } from '../../lib/datetimeUtils';
import { getResponseContentOrError, onlyUniqueById } from '../../lib/utils';
import UserIcon from '../utils/UserIcon';
import { useNotifications } from '../../lib/useNotifications';

type Props = {
    bookings: Booking[];
};

const SendMessageToBookingOwnersButton: React.FC<Props> = ({ bookings }: Props) => {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('step-one');
    const [message, setMessage] = useState('');
    const [selectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);

    const { showGeneralSuccessMessage, showGeneralDangerMessage } = useNotifications();

    const now = new Date();

    const toggleBookingSelection = (booking: Booking) => {
        if (selectedBookingIds.includes(booking.id)) {
            setSelectedBookingIds((ids) => ids.filter((x) => x !== booking.id));
            return;
        }

        setSelectedBookingIds((ids) => [...ids, booking.id]);
    };

    const recipients = bookings
        .filter((x) => selectedBookingIds.includes(x.id))
        .map((x) => x.ownerUser!)
        .filter(onlyUniqueById);

    const hide = () => setShowModal(false);

    const sendMessage = (message: string, bookingIds: number[]) => {
        const body = { message, bookingIds };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/sendMessage/toBookingOwners', request)
            .then((apiResponse) => getResponseContentOrError(apiResponse))
            .then(() => {
                showGeneralSuccessMessage('Meddelande skickat!');
            })
            .catch((error: Error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Meddelandet kunde inte skickas');
            });
    };

    const sendMessageAndClose = () => {
        sendMessage(message, selectedBookingIds);
        setActiveTab('step-one');
        setSelectedBookingIds([]);
        setMessage('');
        hide();
    };

    if (!bookings) {
        return <Skeleton height={150} className="mb-3" />;
    }

    // The user avatar used in the preview requires a id used to generate the color. User -1 has a nice color, we we will use that one.
    const userIdForPreview = -1;

    return (
        <>
            <Button variant="secondary" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faEnvelope} className="mr-1" /> Skicka meddelande till bokningsansvariga
            </Button>
            <Modal show={showModal} onHide={hide} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Skicka meddelande till bokningsansvariga</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tab.Container id="import-equipment-tabs" activeKey={activeTab}>
                        <Tab.Content>
                            <Tab.Pane eventKey="step-one">
                                <Card className="mb-3">
                                    <Card.Header className="p-1"></Card.Header>
                                    <Card.Body>
                                        <div className="d-flex">
                                            <p className="text-muted flex-grow-1 mb-0">
                                                <strong>Steg 1 av 3</strong> Välj bokningar vars ansvariga att skicka
                                                meddelande till.
                                            </p>
                                            <Button
                                                variant="primary"
                                                onClick={() => setActiveTab('step-two')}
                                                className="mr-2"
                                                disabled={selectedBookingIds.length === 0}
                                            >
                                                Gå vidare
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <AdminBookingList
                                    bookings={bookings
                                        .map(toBookingViewModel)
                                        .filter(
                                            (b) => b.usageStartDatetime && b.usageStartDatetime?.getTime() < Date.now(),
                                        )}
                                    selectedBookingIds={selectedBookingIds}
                                    onToggleSelect={toggleBookingSelection}
                                    showHeadings={true}
                                />
                            </Tab.Pane>
                            <Tab.Pane eventKey="step-two">
                                <Card className="mb-3">
                                    <Card.Header className="p-1"></Card.Header>
                                    <Card.Body>
                                        <div className="d-flex">
                                            <p className="text-muted flex-grow-1 mb-0">
                                                <strong>Steg 2 av 3</strong> Skriv meddelande.
                                            </p>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setActiveTab('step-one')}
                                                className="mr-2"
                                            >
                                                Gå tillbaka
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={() => setActiveTab('step-three')}
                                                className="mr-2"
                                                disabled={message.length === 0}
                                            >
                                                Gå vidare
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Form.Group controlId="formName">
                                    <Form.Label>Meddelande</Form.Label>
                                    <Form.Control
                                        required={true}
                                        as="textarea"
                                        name="message"
                                        rows={6}
                                        placeholder="En ny månad har börjat och det är dags att klarmarkera bokningar."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </Form.Group>
                            </Tab.Pane>
                            <Tab.Pane eventKey="step-three">
                                <Card className="mb-3">
                                    <Card.Header className="p-1"></Card.Header>
                                    <Card.Body>
                                        <div className="d-flex">
                                            <p className="text-muted flex-grow-1 mb-0">
                                                <strong>Steg 3 av 3</strong> Förhandsgranskning.
                                            </p>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setActiveTab('step-two')}
                                                className="mr-2"
                                            >
                                                Gå tillbaka
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={() => sendMessageAndClose()}
                                                className="mr-2"
                                            >
                                                <FontAwesomeIcon icon={faEnvelope} className="mr-1" /> Skicka meddelande
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-3">
                                    <Card.Header>Förhandsgranskning av meddelande</Card.Header>
                                    <Card.Body>
                                        <div className="d-flex">
                                            <div className="p-2">
                                                <UserIcon user={{ userId: userIdForPreview, isLoggedIn: false }} />
                                            </div>
                                            <div className="w-100">
                                                <p className="mb-0">
                                                    <strong>Backstage2</strong> {formatTime(now)}
                                                </p>
                                                <p>{message}</p>
                                                <div style={{ borderLeft: '3px solid gray' }} className="pl-2">
                                                    Angående bokningar:
                                                    <ul>
                                                        <li>Exempelbokning 1</li>
                                                        <li>Exempelbokning 2</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                <Card className="mb-3">
                                    <Card.Header>Mottagare</Card.Header>
                                    <Card.Body>
                                        <ul>
                                            {recipients.map((user) => (
                                                <li key={user.id}>
                                                    <p className="mb-0">
                                                        {user.name}{' '}
                                                        {!user.slackId ? (
                                                            <OverlayTrigger
                                                                placement="right"
                                                                overlay={
                                                                    <Tooltip id="1">
                                                                        <strong>
                                                                            Denna användare har inget slack-id
                                                                            konfigurerat och kommer inte att få
                                                                            meddelandet.
                                                                        </strong>
                                                                    </Tooltip>
                                                                }
                                                            >
                                                                <FontAwesomeIcon icon={faWarning} />
                                                            </OverlayTrigger>
                                                        ) : null}
                                                    </p>
                                                    <p className="mb-0 text-muted">
                                                        {bookings
                                                            .filter((x) => x.ownerUser!.id === user.id)
                                                            .filter((x) => selectedBookingIds.includes(x.id))
                                                            .map((x) => x.name)
                                                            .join(', ')}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SendMessageToBookingOwnersButton;
