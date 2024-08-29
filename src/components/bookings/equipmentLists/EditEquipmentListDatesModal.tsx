import React, { FormEvent, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import RequiredIndicator from '../../utils/RequiredIndicator';
import { formatDatetime, formatDatetimeForForm, getFormattedInterval } from '../../../lib/datetimeUtils';
import useSwr from 'swr';
import { CalendarResult } from '../../../models/misc/CalendarResult';
import { getResponseContentOrError } from '../../../lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useLocalStorageState } from '../../../lib/useLocalStorageState';

type Props = {
    show: boolean;
    onHide: () => void;
    equipmentList: EquipmentList;
    onSave: (entryToSave: EquipmentList) => void;
};

const EditEquipmentListDatesModal: React.FC<Props> = ({ show, onHide, equipmentList, onSave }: Props) => {
    const [showInOutFields, setShowInOutFields] = useState<boolean>(
        !!equipmentList.equipmentOutDatetime || !!equipmentList.equipmentInDatetime,
    );

    const [usageStart, setUsageStart] = useState<string>(formatDatetimeForForm(equipmentList.usageStartDatetime));
    const [usageEnd, setUsageEnd] = useState<string>(formatDatetimeForForm(equipmentList.usageEndDatetime));

    const [equipmentOut, setEquipmentOut] = useState<string>(formatDatetimeForForm(equipmentList.equipmentOutDatetime));
    const [equipmentIn, setEquipmentIn] = useState<string>(formatDatetimeForForm(equipmentList.equipmentInDatetime));

    const [equipmentOutCalenderSelection, setEquipmentOutCalenderSelection] = useState<string>(
        equipmentList.equipmentOutDatetime?.getTime()?.toString() ?? '',
    );
    const [equipmentInCalenderSelection, setEquipmentInCalenderSelection] = useState<string>(
        equipmentList.equipmentInDatetime?.getTime()?.toString() ?? '',
    );

    const [wizardSelectedCalendarEvent, setWizardSelectedCalendarEvent] = useState<string>('');
    const [userHasClosedWizard, setUserHasClosedWizard] = useLocalStorageState(
        'hide-equipment-list-calendar-wizard',
        false,
    );

    // Fetch open hours to suggest equipment in and out times
    const { data: openHoursCalendarList, error: openHoursCalendarListError } = useSwr(
        '/api/calendar/open-hours',
        (url) =>
            fetch(url)
                .then((response) => getResponseContentOrError<CalendarResult[]>(response))
                .then((calenderResults) =>
                    calenderResults.map((calenderResult) => ({
                        ...calenderResult,
                        key: new Date(calenderResult.start ?? '').getTime().toString(),
                        label: `${formatDatetime(new Date(calenderResult.start ?? ''))} - ${calenderResult.name}`,
                    })),
                ),
    );

    const dateWithoutTimeRegEx = /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/;
    const calendarEventDateHasTimeComponent = (date: string | null | undefined) =>
        !(date?.match(dateWithoutTimeRegEx) ?? false);
    const { data: bookingsCalendarList, error: bookingsCalendarListError } = useSwr('/api/calendar', (url) =>
        fetch(url)
            .then((response) => getResponseContentOrError<CalendarResult[]>(response))
            .then((calenderResults) =>
                calenderResults
                    .filter(
                        (calenderResult) =>
                            calendarEventDateHasTimeComponent(calenderResult.start) ||
                            calendarEventDateHasTimeComponent(calenderResult.end),
                    )
                    .map((calenderResult) => ({
                        ...calenderResult,
                        key: calenderResult.id,
                        label: `${calenderResult.name} (${getFormattedInterval(new Date(calenderResult.start ?? ''), new Date(calenderResult.end ?? ''), true)})`,
                    })),
            ),
    );

    useEffect(() => {
        const equipmentOutMatchingListEntry = openHoursCalendarList?.find(
            (x) => x.key === new Date(equipmentOut).getTime()?.toString(),
        );
        if (equipmentOutMatchingListEntry) {
            setEquipmentOutCalenderSelection(equipmentOutMatchingListEntry.key);
        } else {
            setEquipmentOutCalenderSelection('');
        }
        const equipmentInMatchingListEntry = openHoursCalendarList?.find(
            (x) => x.key === new Date(equipmentIn).getTime()?.toString(),
        );
        if (equipmentInMatchingListEntry) {
            setEquipmentInCalenderSelection(equipmentInMatchingListEntry.key);
        } else {
            setEquipmentInCalenderSelection('');
        }
    }, [equipmentIn, equipmentOut, openHoursCalendarList]);

    const verifyTimes = () => {
        const usageStartDatetime = new Date(usageStart);
        const usageEndDatetime = new Date(usageEnd);
        const equipmentOutDatetime = new Date(equipmentOut);
        const equipmentInDatetime = new Date(equipmentIn);

        if (
            !usageStartDatetime ||
            !usageEndDatetime ||
            isNaN(usageStartDatetime.getTime()) ||
            isNaN(usageEndDatetime.getTime()) ||
            usageStartDatetime.getTime() >= usageEndDatetime.getTime()
        ) {
            return false;
        }

        if (
            !!showInOutFields &&
            (!equipmentOutDatetime ||
                !equipmentInDatetime ||
                isNaN(equipmentOutDatetime.getTime()) ||
                isNaN(equipmentInDatetime.getTime()) ||
                equipmentOutDatetime.getTime() >= equipmentInDatetime.getTime())
        ) {
            return false;
        }

        return true;
    };

    const handleSubmitWizard = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const calendarEvent = bookingsCalendarList?.find((x) => x.id === wizardSelectedCalendarEvent);

        if (!calendarEvent) {
            throw new Error('Could not find calendar event');
        }

        setUsageStart(formatDatetimeForForm(new Date(calendarEvent.start ?? '')));
        setUsageEnd(formatDatetimeForForm(new Date(calendarEvent.end ?? '')));
    };

    return (
        <Modal show={show} onHide={() => onHide()} size="lg" backdrop="static">
            <Modal.Body>
                {bookingsCalendarList && !bookingsCalendarListError ? (
                    <Card className="mb-3">
                        <Card.Body>
                            <div className="d-flex">
                                <strong className="flex-grow-1">
                                    Hämta debiterad start och sluttid från kalenderhändelse
                                </strong>
                                <Button
                                    className="mr-2"
                                    variant=""
                                    size="sm"
                                    onClick={() => setUserHasClosedWizard((x) => !x)}
                                >
                                    <FontAwesomeIcon icon={!userHasClosedWizard ? faAngleUp : faAngleDown} />
                                </Button>
                            </div>
                            {!userHasClosedWizard ? (
                                <Form
                                    onSubmit={handleSubmitWizard}
                                    id={equipmentList.id + 'calendar-wizard'}
                                    className="d-flex flex-row"
                                >
                                    <div>
                                        <Form.Control
                                            as="select"
                                            value={wizardSelectedCalendarEvent}
                                            onChange={(e) => setWizardSelectedCalendarEvent(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                -
                                            </option>
                                            {bookingsCalendarList.map((x) => (
                                                <option key={x.id} value={x.key}>
                                                    {x.label}
                                                </option>
                                            ))}
                                        </Form.Control>
                                        <Form.Text className="text-muted">
                                            <a
                                                href={
                                                    bookingsCalendarList.find(
                                                        (x) => x.key == wizardSelectedCalendarEvent,
                                                    )?.link
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Visa i Google Calender <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </Form.Text>
                                    </div>
                                    <div>
                                        <Button
                                            form={equipmentList.id + 'calendar-wizard'}
                                            type="submit"
                                            variant="secondary"
                                            className="ml-2"
                                            disabled={!wizardSelectedCalendarEvent}
                                        >
                                            Hämta
                                        </Button>
                                    </div>
                                </Form>
                            ) : null}
                        </Card.Body>
                    </Card>
                ) : null}

                <Row>
                    <Col lg={6}>
                        <Form.Group>
                            <Form.Label>
                                Debiterad starttid
                                <RequiredIndicator />
                            </Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={usageStart}
                                onChange={(e) => setUsageStart(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col lg={6}>
                        <Form.Group>
                            <Form.Label>
                                Debiterad sluttid
                                <RequiredIndicator />
                            </Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={usageEnd}
                                onChange={(e) => setUsageEnd(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="showInOutFields">
                            <Form.Check
                                type="checkbox"
                                label="Sätt andra utlämnings- och återlämningstider"
                                checked={showInOutFields}
                                onChange={() => setShowInOutFields(!showInOutFields)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                {showInOutFields ? (
                    <>
                        <Row>
                            <Col lg={6}>
                                {openHoursCalendarList && !openHoursCalendarListError ? (
                                    <Form.Group controlId="openHours">
                                        <Form.Label>
                                            Utlämning <RequiredIndicator />
                                        </Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={equipmentOutCalenderSelection}
                                            onChange={(e) => {
                                                const startTime = new Date(
                                                    openHoursCalendarList.find((x) => x.key == e.target.value)?.start ??
                                                        '',
                                                );
                                                if (e.target.value === '') {
                                                    setEquipmentOutCalenderSelection('');
                                                } else {
                                                    setEquipmentOutCalenderSelection(startTime.getTime().toString());
                                                    setEquipmentOut(formatDatetimeForForm(startTime));
                                                }
                                            }}
                                        >
                                            <option value="">Anpassad tid</option>
                                            {openHoursCalendarList.map((x) => (
                                                <option key={x.id} value={x.key}>
                                                    {x.label}
                                                </option>
                                            ))}
                                        </Form.Control>
                                        <Form.Text className="text-muted">
                                            <a
                                                href={
                                                    openHoursCalendarList.find(
                                                        (x) => x.key == equipmentOutCalenderSelection,
                                                    )?.link
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Visa i Google Calender <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </Form.Text>
                                    </Form.Group>
                                ) : (
                                    <Form.Label>
                                        Utlämning <RequiredIndicator />
                                    </Form.Label>
                                )}
                                <Form.Group>
                                    <Form.Control
                                        type="datetime-local"
                                        value={equipmentOut}
                                        onChange={(e) => setEquipmentOut(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                {openHoursCalendarList && !openHoursCalendarListError ? (
                                    <Form.Group controlId="openHours">
                                        <Form.Label>
                                            Återlämning <RequiredIndicator />
                                        </Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={equipmentInCalenderSelection}
                                            onChange={(e) => {
                                                const startTime = new Date(
                                                    openHoursCalendarList.find((x) => x.key == e.target.value)?.start ??
                                                        '',
                                                );
                                                if (e.target.value === '') {
                                                    setEquipmentInCalenderSelection('');
                                                } else {
                                                    setEquipmentInCalenderSelection(startTime.getTime().toString());
                                                    setEquipmentIn(formatDatetimeForForm(startTime));
                                                }
                                            }}
                                        >
                                            <option value="">Anpassad tid</option>
                                            {openHoursCalendarList.map((x) => (
                                                <option key={x.id} value={x.key}>
                                                    {x.label}
                                                </option>
                                            ))}
                                        </Form.Control>
                                        <Form.Text className="text-muted">
                                            <a
                                                href={
                                                    openHoursCalendarList.find(
                                                        (x) => x.key == equipmentInCalenderSelection,
                                                    )?.link
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Visa i Google Calender <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </a>
                                        </Form.Text>
                                    </Form.Group>
                                ) : (
                                    <Form.Label>
                                        Återlämning <RequiredIndicator />
                                    </Form.Label>
                                )}
                                <Form.Group>
                                    <Form.Control
                                        type="datetime-local"
                                        value={equipmentIn}
                                        onChange={(e) => setEquipmentIn(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onHide()}>
                    Avbryt
                </Button>
                <Button
                    variant="primary"
                    disabled={!verifyTimes()}
                    onClick={() => {
                        const entryToSave: EquipmentList = {
                            ...equipmentList,
                            usageStartDatetime: new Date(usageStart),
                            usageEndDatetime: new Date(usageEnd),
                            equipmentOutDatetime: showInOutFields ? new Date(equipmentOut) : null,
                            equipmentInDatetime: showInOutFields ? new Date(equipmentIn) : null,
                        };
                        onSave(entryToSave);
                    }}
                >
                    Spara
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditEquipmentListDatesModal;
