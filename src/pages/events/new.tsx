import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button, Card, Tab } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { IEventObjectionModel } from '../../models/objection-models';
import EventForm from '../../components/events/EventForm';
import { convertToDateOrUndefined, getResponseContentOrError } from '../../lib/utils';
import { Event } from '../../models/interfaces';
import { Status } from '../../models/enums/Status';
import Header from '../../components/layout/Header';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import CalendarEventsList from '../../components/events/CalendarEventsList';
import { CalendarResult } from '../../models/misc/CalendarResult';
import { EquipmentListObjectionModel, IEquipmentListObjectionModel } from '../../models/objection-models/EventObjectionModel';
import { useNotifications } from '../../lib/useNotifications';
import { Role } from '../../models/enums/Role';

export const getServerSideProps = useUserWithDefaultAccessControl(Role.USER);
type Props = { user: CurrentUserInfo };

const EventPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny bokning';
    const [selectedDefaultEvent, setSelectedDefaultEvent] = useState<Partial<Event> | undefined>();
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const {
        showCreateSuccessNotification,
        showCreateFailedNotification,
    } = useNotifications();

    const breadcrumbs = [
        { link: '/events', displayName: 'Bokningar' },
        { link: '/events/new', displayName: pageTitle },
    ];

    const resetSelectedEvent = () => {
        setSelectedDefaultEvent(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
    }

    const createEventFrom = (calendarEvent: CalendarResult | null) => {
        setSelectedDefaultEvent({
            status: Status.DRAFT,
            salaryStatus: SalaryStatus.NOT_SENT,
            name: calendarEvent?.name?.replace(/\s*\[[^[]*\]\s*/g, "") ?? '',
            note: calendarEvent?.description,
            location: calendarEvent?.location,
            calendarEventId: calendarEvent?.id
        });

        if (calendarEvent) {
            // Some events have time, some only have dates. This code tries to detect the ones with only date and sets default times.
            const dateWithoutTimeRegEx = /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/;
            if (calendarEvent.start && calendarEvent.start.match(dateWithoutTimeRegEx)) {
                setStartDate(convertToDateOrUndefined(calendarEvent.start + 'T00:00')?.toISOString());

            } else {
                setStartDate(convertToDateOrUndefined(calendarEvent.start)?.toISOString());
            }

            if (calendarEvent.end && calendarEvent.end.length <= 10) {
                setEndDate(convertToDateOrUndefined(calendarEvent.end + 'T23:59')?.toISOString());
            } else {
                setEndDate(convertToDateOrUndefined(calendarEvent.end)?.toISOString());
            }
        }
    }

    const handleSubmit = async (event: Partial<IEventObjectionModel>) => {
        const body = { event: event };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/events', request)
            .then((apiResponse) => getResponseContentOrError<IEventObjectionModel>(apiResponse))
            .then((data) => {
                createDefaultEquipmentList(data.id)
                    .then(() => {
                        showCreateSuccessNotification('Bokningen');
                        router.push('/events/' + data.id);
                    })
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Bokningen');
            });
    };

    const createDefaultEquipmentList = async (eventId: number) => {
        const newEquipmentList: Partial<EquipmentListObjectionModel> = {
            name: 'Utrustning',
            usageStartDatetime: startDate,
            usageEndDatetime: endDate,
            equipmentOutDatetime: startDate,
            equipmentInDatetime: endDate,
        };
        const body = { equipmentList: newEquipmentList };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        return fetch('/api/events/' + eventId + '/equipmentLists', request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse))
    };

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

            <Tab.Container id="new-event-tabs" activeKey={selectedDefaultEvent ? 'step-two' : 'step-one'}>
                <Tab.Content>
                    <Tab.Pane eventKey="step-one">
                        <Card className="mb-3">
                            <Card.Header className="p-1"></Card.Header>
                            <Card.Body>
                                <div className="d-flex">
                                    <p className="text-muted flex-grow-1 mb-0"><strong>Steg 1 av 2</strong> Välj en bokning från kalendern nedan eller skapa en manuellt.</p>
                                    <Button onClick={() => createEventFrom(null)}>
                                        Skapa bokning manuellt
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        <CalendarEventsList onSelect={(calendarEvent) => createEventFrom(calendarEvent)} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="step-two">
                        <Card className="mb-3">
                            <Card.Header className="p-1"></Card.Header>
                            <Card.Body>
                                <div className="d-flex">
                                    <p className="text-muted flex-grow-1 mb-0"><strong>Steg 2 av 2</strong> Fyll i bokningsdetaljerna nedan.</p>
                                    <Button variant="secondary" onClick={() => resetSelectedEvent()} className="mr-2">
                                        Avbryt
                                    </Button>
                                    <Button variant="primary" form="editEventForm" type="submit">
                                        Lägg till bokning
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                        {selectedDefaultEvent ?
                            <EventForm
                                handleSubmitEvent={handleSubmit}
                                formId="editEventForm"
                                event={selectedDefaultEvent}
                                isNewBooking={true}
                            /> : null}
                        <Button variant="primary" form="editEventForm" type="submit" className="mb-3">
                            Lägg till bokning
                        </Button>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Layout>
    );
};

export default EventPage;
