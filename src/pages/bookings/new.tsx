import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button, Card, Tab } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
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
import CustomerSearch from '../../components/CustomerSearch';
import { Customer } from '../../models/interfaces/Customer';
import { BookingType } from '../../models/enums/BookingType';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { Language } from '../../models/enums/Language';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.USER);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const BookingPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny bokning';
    const [selectedDefaultBooking, setSelectedDefaultBooking] = useState<Partial<Booking> | undefined>();
    const [wizardStep, setWizardStep] = useState<'step-one' | 'step-two' | 'step-three'>('step-one');
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
        setWizardStep('step-one');
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

            // Try to detect rentals based on calendar event name
            if (calendarBooking.name?.toLowerCase()?.includes('[hyra]')) {
                setSelectedDefaultBooking((booking) => ({ ...booking, bookingType: BookingType.RENTAL }));
            } else {
                setSelectedDefaultBooking((booking) => ({ ...booking, bookingType: BookingType.GIG }));
            }
        }

        setWizardStep('step-two');
    };

    const selectCustomer = (customer: Customer | null) => {
        if (customer === null) {
            setWizardStep('step-three');
            return;
        }

        // Extend default booking with customer info
        setSelectedDefaultBooking((booking) => ({
            ...booking,
            customerName: customer.name ?? undefined,
            accountKind: customer.accountKind ?? undefined,
            pricePlan: customer.pricePlan ?? undefined,
            invoiceHogiaId: customer.invoiceHogiaId ?? undefined,
            invoiceAddress: customer.invoiceAddress ?? undefined,
            language: customer.language ?? undefined,
        }));

        setWizardStep('step-three');
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
                createDefaultEquipmentList(data).then(() => {
                    showCreateSuccessNotification('Bokningen');
                    router.push('/bookings/' + data.id);
                });
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Bokningen');
            });
    };

    const createDefaultEquipmentList = async (booking: IBookingObjectionModel) => {
        let name;
        switch (booking.language) {
            case Language.EN:
                name = 'Equipment';
                break;
            case Language.SV:
            default:
                name = 'Utrustning';
                break;
        }

        const newEquipmentList: Partial<EquipmentListObjectionModel> = {
            name,
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

        return fetch('/api/bookings/' + booking.id + '/equipmentLists', request).then((apiResponse) =>
            getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse),
        );
    };

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

            <Tab.Container id="new-booking-tabs" activeKey={wizardStep}>
                <Tab.Content>
                    <Tab.Pane eventKey="step-one">
                        <Card className="mb-3">
                            <Card.Header className="p-1"></Card.Header>
                            <Card.Body>
                                <div className="d-flex">
                                    <p className="text-muted flex-grow-1 mb-0">
                                        <strong>Steg 1 av 3</strong> Välj en bokning från kalendern nedan eller skapa en
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
                                        <strong>Steg 2 av 3</strong> Sök efter en kund nedan eller fortsätt utan kund.
                                    </p>
                                    <Button variant="secondary" onClick={() => resetSelectedBooking()} className="mr-2">
                                        Avbryt
                                    </Button>
                                    <Button onClick={() => selectCustomer(null)}>Fyll i kunddetaljer manuellt</Button>
                                </div>
                            </Card.Body>
                        </Card>

                        <CustomerSearch
                            id={'customer-search'}
                            placeholder="Sök..."
                            onSelect={(x) => selectCustomer(x)}
                            autoFocus={true}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="step-three">
                        <Card className="mb-3">
                            <Card.Header className="p-1"></Card.Header>
                            <Card.Body>
                                <div className="d-flex">
                                    <p className="text-muted flex-grow-1 mb-0">
                                        <strong>Steg 3 av 3</strong> Fyll i bokningsdetaljerna nedan.
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
                        {selectedDefaultBooking && wizardStep == 'step-three' ? (
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
