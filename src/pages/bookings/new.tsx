import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button, Card, Tab } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { IBookingObjectionModel } from '../../models/objection-models';
import BookingForm from '../../components/bookings/BookingForm';
import { getResponseContentOrError } from '../../lib/utils';
import { Booking } from '../../models/interfaces';
import { Status } from '../../models/enums/Status';
import Header from '../../components/layout/Header';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import CalendarBookingsList from '../../components/bookings/CalendarBookingsList';
import { CalendarResult } from '../../models/misc/CalendarResult';
import {
    EquipmentListObjectionModel,
    IEquipmentListObjectionModel,
} from '../../models/objection-models/BookingObjectionModel';
import { useNotifications } from '../../lib/useNotifications';
import { Role } from '../../models/enums/Role';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { addDays, toDatetimeOrUndefined } from '../../lib/datetimeUtils';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl(Role.USER);
type Props = { user: CurrentUserInfo };

const BookingPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny bokning';
    const [selectedDefaultBooking, setSelectedDefaultBooking] = useState<Partial<Booking> | undefined>();
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

    const breadcrumbs = [
        { link: '/bookings', displayName: 'Bokningar' },
        { link: '/bookings/new', displayName: pageTitle },
    ];

    const resetSelectedBooking = () => {
        setSelectedDefaultBooking(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
    };

    const createBookingFrom = (calendarBooking: CalendarResult | null) => {
        setSelectedDefaultBooking({
            status: Status.DRAFT,
            salaryStatus: SalaryStatus.NOT_SENT,
            name: calendarBooking?.name?.replace(/\s*\[[^[]*\]\s*/g, '') ?? '',
            note: calendarBooking?.description,
            location: calendarBooking?.location,
            calendarBookingId: calendarBooking?.id,
            ownerUserId: currentUser.userId,
        });

        if (calendarBooking) {
            // Some bookings have time, some only have dates. This code tries to detect the ones with only date and sets default times.
            const dateWithoutTimeRegEx = /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/;
            if (calendarBooking.start && calendarBooking.start.match(dateWithoutTimeRegEx)) {
                setStartDate(toDatetimeOrUndefined(calendarBooking.start + 'T00:00')?.toISOString());
            } else {
                setStartDate(toDatetimeOrUndefined(calendarBooking.start)?.toISOString());
            }

            if (calendarBooking.end && calendarBooking.end.length <= 10) {
                setEndDate(addDays(toDatetimeOrUndefined(calendarBooking.end + 'T00:00'), 1)?.toISOString());
            } else {
                setEndDate(toDatetimeOrUndefined(calendarBooking.end)?.toISOString());
            }
        }
    };

    const handleSubmit = async (booking: Partial<IBookingObjectionModel>) => {
        const body = { booking: booking };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings', request)
            .then((apiResponse) => getResponseContentOrError<IBookingObjectionModel>(apiResponse))
            .then((data) => {
                createDefaultEquipmentList(data.id).then(() => {
                    showCreateSuccessNotification('Bokningen');
                    router.push('/bookings/' + data.id);
                });
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Bokningen');
            });
    };

    const createDefaultEquipmentList = async (bookingId: number) => {
        const newEquipmentList: Partial<EquipmentListObjectionModel> = {
            name: 'Utrustning',
            usageStartDatetime: startDate,
            usageEndDatetime: endDate,
            numberOfDays: !startDate && !endDate ? 1 : undefined,
        };
        const body = { equipmentList: newEquipmentList };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        return fetch('/api/bookings/' + bookingId + '/equipmentLists', request).then((apiResponse) =>
            getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse),
        );
    };

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

            <Tab.Container id="new-booking-tabs" activeKey={selectedDefaultBooking ? 'step-two' : 'step-one'}>
                <Tab.Content>
                    <Tab.Pane eventKey="step-one">
                        <Card className="mb-3">
                            <Card.Header className="p-1"></Card.Header>
                            <Card.Body>
                                <div className="d-flex">
                                    <p className="text-muted flex-grow-1 mb-0">
                                        <strong>Steg 1 av 2</strong> Välj en bokning från kalendern nedan eller skapa en
                                        manuellt.
                                    </p>
                                    <Button onClick={() => createBookingFrom(null)}>Skapa bokning manuellt</Button>
                                </div>
                            </Card.Body>
                        </Card>

                        <CalendarBookingsList onSelect={(calendarBooking) => createBookingFrom(calendarBooking)} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="step-two">
                        <Card className="mb-3">
                            <Card.Header className="p-1"></Card.Header>
                            <Card.Body>
                                <div className="d-flex">
                                    <p className="text-muted flex-grow-1 mb-0">
                                        <strong>Steg 2 av 2</strong> Fyll i bokningsdetaljerna nedan.
                                    </p>
                                    <Button variant="secondary" onClick={() => resetSelectedBooking()} className="mr-2">
                                        Avbryt
                                    </Button>
                                    <Button variant="primary" form="editBookingForm" type="submit">
                                        <FontAwesomeIcon icon={faSave} className="mr-1" /> Lägg till bokning
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                        {selectedDefaultBooking ? (
                            <BookingForm
                                handleSubmitBooking={handleSubmit}
                                formId="editBookingForm"
                                booking={selectedDefaultBooking}
                                isNewBooking={true}
                            />
                        ) : null}
                        <Button variant="primary" form="editBookingForm" type="submit" className="mb-3">
                            <FontAwesomeIcon icon={faSave} className="mr-1" /> Lägg till bokning
                        </Button>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Layout>
    );
};

export default BookingPage;
