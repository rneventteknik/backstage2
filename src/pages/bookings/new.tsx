import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button, Card, Tab } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { IBookingObjectionModel } from '../../models/objection-models';
import BookingForm from '../../components/bookings/BookingForm';
import { getResponseContentOrError, getGlobalSetting } from '../../lib/utils';
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
import { addEquipment, addListEntryApiCall, getDefaultEquipmentListName } from '../../lib/equipmentListUtils';
import { PricePlan } from '../../models/enums/PricePlan';
import BookingSpecificationUploader from '../../components/utils/BookingSpecificationUploader';
import {
    BookingSpecificationEquipmentModel,
    BookingSpecificationImportModel,
    BookingSpecificationModel,
} from '../../models/misc/BookingSpecificationImportModel';
import { EquipmentListEntry } from '../../models/interfaces/EquipmentList';
import { toEquipmentList } from '../../lib/mappers/booking';
import EmailThreadSelector from '../../components/bookings/EmailThreadSelector';
import { EmailThreadResult } from '../../models/misc/EmailThreadResult';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.USER);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const BookingPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny bokning';
    const [selectedDefaultBooking, setSelectedDefaultBooking] = useState<Partial<Booking> | undefined>();
    const [wizardStep, setWizardStep] = useState<'step-one' | 'step-two' | 'step-three' | 'step-four'>('step-one');
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();
    const [equipment, setEquipment] = useState<BookingSpecificationEquipmentModel[] | undefined>();
    const [loadingAttachment, setLoadingAttachment] = useState(false);
    const [parsedSpecData, setParsedSpecData] = useState<BookingSpecificationImportModel | undefined>();

    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

    const breadcrumbs = [
        { link: '/bookings', displayName: 'Bokningar' },
        { link: '/bookings/new', displayName: pageTitle },
    ];

    const resetSelectedBooking = () => {
        setSelectedDefaultBooking(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
        setParsedSpecData(undefined);
        setWizardStep('step-one');
    };

    const createBookingFromCalendar = (calendarBooking: CalendarResult | null) => {
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

    const selectEmailThread = async (threadId: string) => {
        setSelectedDefaultBooking((booking) => ({
            ...booking,
            emailThreads: [{ threadId }] as Booking['emailThreads'],
        }));
        setLoadingAttachment(true);

        try {
            const thread = await fetch(`/api/email/${threadId}`).then((response) =>
                getResponseContentOrError<EmailThreadResult>(response),
            );

            const bookingAddress = getGlobalSetting('email.bookingSiteAddress', globalSettings, 'booking@rneventteknik.se');
            const attachmentFileName = getGlobalSetting('email.bookingSiteAttachmentFileName', globalSettings, 'booking.txt');

            // Look for a message from the booking site with the expected attachment
            const bookingMessage = thread.messages.find(
                (msg) => msg.from?.includes(bookingAddress) && msg.attachments?.some((a) => a.filename === attachmentFileName),
            );

            if (bookingMessage) {
                const attachment = bookingMessage.attachments?.find((a) => a.filename === attachmentFileName);
                if (attachment) {
                    const attachmentResponse = await fetch(
                        `/api/email/${bookingMessage.id}/attachments/${attachment.attachmentId}`,
                    ).then((response) => getResponseContentOrError<{ data: string }>(response));

                    try {
                        const parsed = JSON.parse(attachmentResponse.data) as BookingSpecificationImportModel;
                        // Valid booking spec found - show the uploader for review
                        setParsedSpecData(parsed);
                        setLoadingAttachment(false);
                        return;
                    } catch {
                        // JSON parse failed, proceed without spec
                    }
                }
            }

            // No matching attachment found, proceed to step 4
            setLoadingAttachment(false);
            setWizardStep('step-four');
        } catch {
            // Error fetching thread, proceed to step 4
            setLoadingAttachment(false);
            setWizardStep('step-four');
        }
    };

    const createBookingFromFile = (fileContent?: BookingSpecificationModel) => {
        if (!fileContent) {
            setWizardStep('step-four');
            return;
        }

        // Extend default booking with info from fileContent
        setSelectedDefaultBooking((booking) => ({
            ...booking,
            name: fileContent.projectName,
            note: fileContent.description,
            pricePlan: fileContent.isThsMember ? PricePlan.THS : PricePlan.EXTERNAL,
            contactPersonEmail: fileContent.email,
            contactPersonName: fileContent.firstName + ' ' + fileContent.lastName,
            contactPersonPhone: fileContent.phoneNumber,
        }));

        // Only use the start and end date from file if not already set from calendar event selection
        if (!startDate && !endDate) {
            setStartDate(fileContent.startDate + 'T00:00');
            setEndDate(fileContent.endDate + 'T00:00');
        }

        setEquipment(fileContent.equipment);

        // If booking type is not set from calender event selection, default to rental.
        if (!selectedDefaultBooking?.bookingType) {
            setSelectedDefaultBooking((booking) => ({
                ...booking,
                bookingType: BookingType.RENTAL,
            }));
        }

        setWizardStep('step-four');
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
            .then(async (data) => {
                await createDefaultEquipmentList(data);
                showCreateSuccessNotification('Bokningen');
                router.push('/bookings/' + data.id);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Bokningen');
            });
    };

    const createDefaultEquipmentList = async (booking: IBookingObjectionModel) => {
        const newEquipmentList: Partial<EquipmentListObjectionModel> = {
            name: getDefaultEquipmentListName(booking.language),
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

        return fetch('/api/bookings/' + booking.id + '/equipmentLists', request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse))
            .then((equipmentList) => {
                createDefaultEquipmentListEntries(booking, equipmentList);
            });
    };

    const createDefaultEquipmentListEntries = async (
        booking: IBookingObjectionModel,
        equipmentList: IEquipmentListObjectionModel,
    ) => {
        equipment?.forEach((equipmentEntry) => {
            const saveFunction = (entries: EquipmentListEntry[]) =>
                entries.map((entry) => addListEntryApiCall(entry, booking.id, equipmentList.id));
            addEquipment(
                equipmentEntry.equipment,
                toEquipmentList(equipmentList),
                booking.pricePlan,
                booking.language,
                saveFunction,
                equipmentEntry.amount,
                equipmentEntry.hours ?? undefined,
                equipmentEntry.selectedPrice?.id,
            );
        });
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
                                <div className="d-flex align-items-center">
                                    <p className="text-muted flex-grow-1 mb-0">
                                        <strong>Steg 1 av 4</strong> Välj en bokning från kalendern nedan eller skapa en
                                        manuellt.
                                    </p>
                                    <Button onClick={() => createBookingFromCalendar(null)} className="text-nowrap">
                                        Skapa bokning manuellt
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        <CalendarBookingsList
                            onSelect={(calendarBooking) => createBookingFromCalendar(calendarBooking)}
                        />
                    </Tab.Pane>
                    <Tab.Pane eventKey="step-two">
                        <Card className="mb-3">
                            <Card.Header className="p-1"></Card.Header>
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <p className="text-muted flex-grow-1 mb-0">
                                        <strong>Steg 2 av 4</strong> Sök efter en kund nedan eller fortsätt utan kund.
                                    </p>
                                    <Button variant="secondary" onClick={() => resetSelectedBooking()} className="me-2 text-nowrap">
                                        Avbryt
                                    </Button>
                                    <Button onClick={() => selectCustomer(null)} className="text-nowrap">Fyll i kunddetaljer manuellt</Button>
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
                                <div className="d-flex align-items-center">
                                    <p className="text-muted flex-grow-1 mb-0">
                                        <strong>Steg 3 av 4</strong> Välj en emailtråd att koppla till bokningen. Innehåller emailet en bokningsfil från externsidan kommer bokningsinformationen hämtas automatiskt från den.
                                    </p>
                                    <Button variant="secondary" onClick={() => resetSelectedBooking()} className="me-2 text-nowrap">
                                        Avbryt
                                    </Button>
                                    <Button variant={loadingAttachment || parsedSpecData ? 'secondary' : 'primary'} onClick={() => createBookingFromFile()} className="text-nowrap">
                                        Koppla inte emailtråd
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                        {selectedDefaultBooking && wizardStep == 'step-three' ? (
                            loadingAttachment ? (
                                <Card className="mb-3">
                                    <Card.Body className="text-center text-muted">
                                        Laddar emailtråd...
                                    </Card.Body>
                                </Card>
                            ) : parsedSpecData ? (
                                <BookingSpecificationUploader
                                    onSave={createBookingFromFile}
                                    initialData={parsedSpecData}
                                />
                            ) : (
                                <EmailThreadSelector onSelect={selectEmailThread} />
                            )
                        ) : null}
                    </Tab.Pane>
                    <Tab.Pane eventKey="step-four">
                        <Card className="mb-3">
                            <Card.Header className="p-1"></Card.Header>
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <p className="text-muted flex-grow-1 mb-0">
                                        <strong>Steg 4 av 4</strong> Fyll i bokningsdetaljerna nedan.
                                    </p>
                                    <Button variant="secondary" onClick={() => resetSelectedBooking()} className="me-2 text-nowrap">
                                        Avbryt
                                    </Button>
                                    <Button variant="primary" form="editBookingForm" type="submit" className="text-nowrap">
                                        <FontAwesomeIcon icon={faSave} className="me-1" /> Lägg till bokning
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                        {selectedDefaultBooking && wizardStep == 'step-four' ? (
                            <BookingForm
                                handleSubmitBooking={handleSubmit}
                                formId="editBookingForm"
                                booking={selectedDefaultBooking}
                                isNewBooking={true}
                            />
                        ) : null}
                        <Button variant="primary" form="editBookingForm" type="submit" className="mb-3">
                            <FontAwesomeIcon icon={faSave} className="me-1" /> Lägg till bokning
                        </Button>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Layout>
    );
};

export default BookingPage;
