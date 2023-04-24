import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Badge, Button, ButtonGroup, Card, Col, Dropdown, ListGroup, Row } from 'react-bootstrap';
import {
    getAccountKindName,
    getLanguageName,
    getPaymentStatusName,
    getDefaultLaborHourlyRate,
    getPricePlanName,
    getResponseContentOrError,
    getStatusName,
} from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
import Link from 'next/link';
import { IfAdmin, IfNotReadonly } from '../../../components/utils/IfAdmin';
import BookingTypeTag from '../../../components/utils/BookingTypeTag';
import { bookingFetcher } from '../../../lib/fetchers';
import TimeEstimateList from '../../../components/bookings/timeEstimate/TimeEstimateList';
import TimeReportList from '../../../components/bookings/timeReport/TimeReportList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { faClock, faCoins, faFileDownload, faPen, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import { Role } from '../../../models/enums/Role';
import EquipmentLists from '../../../components/bookings/equipmentLists/EquipmentLists';
import BookingStatusButton from '../../../components/bookings/BookingStatusButton';
import { IBookingObjectionModel } from '../../../models/objection-models';
import { toBooking } from '../../../lib/mappers/booking';
import { useNotifications } from '../../../lib/useNotifications';
import { Status } from '../../../models/enums/Status';
import { PaymentStatus } from '../../../models/enums/PaymentStatus';
import ChangelogCard from '../../../components/ChangelogCard';
import {
    addVAT,
    formatNumberAsCurrency,
    getBookingPrice,
    getEquipmentListPrice,
    getTotalTimeEstimatesPrice,
} from '../../../lib/pricingUtils';
import { Language } from '../../../models/enums/Language';
import BookingRentalStatusButton from '../../../components/bookings/BookingRentalStatusButton';
import { PartialDeep } from 'type-fest';
import { TimeEstimate, TimeReport } from '../../../models/interfaces';
import TimeEstimateAddButton from '../../../components/bookings/timeEstimate/TimeEstimateAddButton';
import TimeReportAddButton from '../../../components/bookings/timeReport/TimeReportAddButton';
import RentalStatusTag from '../../../components/utils/RentalStatusTag';
import { getNumberOfBookingDays, getNumberOfEventHours, toBookingViewModel } from '../../../lib/datetimeUtils';
import { KeyValue } from '../../../models/interfaces/KeyValue';
import MarkdownCard from '../../../components/MarkdownCard';
import ToggleCoOwnerButton from '../../../components/bookings/ToggleCoOwnerButton';
import ConfirmModal from '../../../components/utils/ConfirmModal';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const BookingPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { showSaveSuccessNotification, showSaveFailedNotification } = useNotifications();
    const [showTimeEstimateContent, setShowTimeEstimateContent] = useState(false);
    const [showTimeReportContent, setShowTimeReportContent] = useState(false);

    const [showConfirmReadyForCashPaymentModal, setShowConfirmReadyForCashPaymentModal] = useState(false);
    const [showConfirmPaidModal, setShowConfirmPaidModal] = useState(false);

    // Edit booking
    //
    const router = useRouter();
    const { data, error, mutate } = useSwr('/api/bookings/' + router.query.id, bookingFetcher);

    if (error) {
        return (
            <ErrorPage
                errorMessage={error.message}
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            />
        );
    }

    if (!data) {
        return (
            <TwoColLoadingPage
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            ></TwoColLoadingPage>
        );
    }

    const booking = toBookingViewModel(data);

    const saveBooking = async (booking: PartialDeep<IBookingObjectionModel>) => {
        const body = { booking: { ...booking, id: router.query.id } };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + router.query.id, request)
            .then((apiResponse) => getResponseContentOrError<IBookingObjectionModel>(apiResponse))
            .then(toBooking)
            .then((booking) => {
                mutate(booking);
                showSaveSuccessNotification('Bokningen');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Bokningen');
            });
    };

    const updateBookingPaymentStatus = async (paymentStatus: PaymentStatus) => {
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/bookings/paymentStatus/' + router.query.id + '?status=' + paymentStatus, request)
            .then((apiResponse) => getResponseContentOrError(apiResponse))
            .then(() => {
                mutate();
                showSaveSuccessNotification('Bokningen');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Bokningen');
            });
    };

    // The page itself
    //
    const pageTitle = booking?.name;
    const breadcrumbs = [
        { link: '/bookings', displayName: 'Bokningar' },
        { link: '/bookings/' + booking.id, displayName: pageTitle },
    ];

    const mutateTimeEstimates = (updatedTimeEstimates: TimeEstimate[]) => {
        if (!booking) {
            throw new Error('Invalid booking');
        }
        mutate({ ...booking, timeEstimates: updatedTimeEstimates }, false);
    };

    const mutateTimeReports = (updatedTimeReports: TimeReport[]) => {
        if (!booking) {
            throw new Error('Invalid booking');
        }
        mutate({ ...booking, timeReports: updatedTimeReports }, false);
    };

    const onAddTimeEstimate = async (timeEstimate: TimeEstimate) => {
        setShowTimeEstimateContent(true);
        mutateTimeEstimates([...(booking.timeEstimates ?? []), timeEstimate]);
    };

    const onAddTimeReport = async (timeReport: TimeReport) => {
        setShowTimeReportContent(true);
        mutateTimeReports([...(booking.timeReports ?? []), timeReport]);
    };

    const defaultLaborHourlyRate = getDefaultLaborHourlyRate(booking.pricePlan, globalSettings);

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <IfAdmin currentUser={currentUser} or={booking.status !== Status.DONE}>
                        <Link href={'/bookings/' + booking.id + '/edit'} passHref>
                            <Button variant="primary" href={'/bookings/' + booking.id + '/edit'}>
                                <FontAwesomeIcon icon={faPen} className="mr-1" /> Redigera
                            </Button>
                        </Link>
                    </IfAdmin>

                    <BookingStatusButton booking={booking} onChange={saveBooking} />
                    <BookingRentalStatusButton booking={booking} onChange={saveBooking} />
                </IfNotReadonly>
                <Dropdown as={ButtonGroup}>
                    <Button
                        variant="secondary"
                        href={`/api/documents/price-estimate/${booking.language}/${booking.id}`}
                        target="_blank"
                    >
                        <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Prisuppskattning
                    </Button>

                    <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />

                    <Dropdown.Menu>
                        <Dropdown.Item href={'/api/documents/packing-list/sv/' + booking.id} target="_blank">
                            <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" /> Packlista
                        </Dropdown.Item>
                        <Dropdown.Item
                            href={`/api/documents/rental-agreement/${booking.language}/` + booking.id}
                            target="_blank"
                        >
                            <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" /> Hyresavtal
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <IfNotReadonly currentUser={currentUser} and={booking.status !== Status.DONE}>
                    <Dropdown as={ButtonGroup}>
                        <TimeReportAddButton
                            booking={booking}
                            disabled={booking.status === Status.DONE}
                            onAdd={onAddTimeReport}
                            currentUser={currentUser}
                            variant="secondary"
                            defaultLaborHourlyRate={defaultLaborHourlyRate}
                        >
                            <FontAwesomeIcon icon={faStopwatch} className="mr-1" />
                            Rapportera tid
                        </TimeReportAddButton>

                        <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />

                        <Dropdown.Menu>
                            <TimeEstimateAddButton
                                booking={booking}
                                disabled={booking.status === Status.DONE}
                                onAdd={onAddTimeEstimate}
                                defaultLaborHourlyRate={defaultLaborHourlyRate}
                                variant="secondary"
                                className="dropdown-item"
                            >
                                <FontAwesomeIcon icon={faClock} className="mr-1 fw" />
                                Ny tidsuppskattning
                            </TimeEstimateAddButton>
                        </Dropdown.Menu>
                    </Dropdown>
                </IfNotReadonly>
                <ToggleCoOwnerButton booking={booking} currentUser={currentUser} variant="secondary" />
                <IfNotReadonly
                    currentUser={currentUser}
                    and={booking.status === Status.DONE && booking.paymentStatus === PaymentStatus.NOT_PAID}
                >
                    <Button variant="secondary" onClick={() => setShowConfirmReadyForCashPaymentModal(true)}>
                        <FontAwesomeIcon icon={faCoins} className="mr-1 fw" /> Skicka till KårX för betalning
                    </Button>
                    <ConfirmModal
                        show={showConfirmReadyForCashPaymentModal}
                        onHide={() => setShowConfirmReadyForCashPaymentModal(false)}
                        onConfirm={() => {
                            updateBookingPaymentStatus(PaymentStatus.READY_FOR_CASH_PAYMENT);
                            setShowConfirmReadyForCashPaymentModal(false);
                        }}
                        title="Bekräfta"
                        confirmLabel="Markera som redo att betalas i KårX"
                        confirmButtonType="primary"
                    >
                        Vill du markera bokningen <em>{booking.name}</em> som redo att betalas i KårX?
                    </ConfirmModal>

                    <Button variant="secondary" onClick={() => setShowConfirmPaidModal(true)}>
                        <FontAwesomeIcon icon={faCoins} className="mr-1 fw" /> Markera som betald
                    </Button>
                    <ConfirmModal
                        show={showConfirmPaidModal}
                        onHide={() => setShowConfirmPaidModal(false)}
                        onConfirm={() => {
                            updateBookingPaymentStatus(PaymentStatus.PAID);
                            setShowConfirmPaidModal(false);
                        }}
                        title="Bekräfta"
                        confirmLabel="Markera som betald"
                        confirmButtonType="primary"
                    >
                        Vill du markera bokningen <em>{booking.name}</em> som betald?
                    </ConfirmModal>
                </IfNotReadonly>
            </Header>

            <Row className="mb-3">
                <Col xl={8}>
                    <TimeEstimateList
                        showContent={showTimeEstimateContent}
                        setShowContent={setShowTimeEstimateContent}
                        bookingId={booking.id}
                        pricePlan={booking.pricePlan}
                        readonly={currentUser.role === Role.READONLY || booking.status === Status.DONE}
                        defaultLaborHourlyRate={defaultLaborHourlyRate}
                    />
                    <TimeReportList
                        showContent={showTimeReportContent}
                        setShowContent={setShowTimeReportContent}
                        bookingId={booking.id}
                        pricePlan={booking.pricePlan}
                        currentUser={currentUser}
                        readonly={currentUser.role === Role.READONLY || booking.status === Status.DONE}
                        defaultLaborHourlyRate={defaultLaborHourlyRate}
                    />
                    <EquipmentLists
                        bookingId={booking.id}
                        readonly={currentUser.role === Role.READONLY || booking.status === Status.DONE}
                        globalSettings={globalSettings}
                    />
                </Col>
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>
                            <div style={{ fontSize: '1.6em' }}>{booking.name}</div>
                            <BookingTypeTag booking={booking} />
                            <Badge variant="dark" className="ml-1">
                                {getStatusName(booking.status)}
                            </Badge>
                            <RentalStatusTag booking={booking} className="ml-1" />
                            <Badge variant="dark" className="ml-1">
                                {getPaymentStatusName(booking.paymentStatus)}
                            </Badge>
                            {booking.language !== Language.SV ? (
                                <Badge variant="dark" className="ml-1">
                                    {getLanguageName(booking.language)}
                                </Badge>
                            ) : null}
                            <div className="text-muted mt-2"> {booking.customerName}</div>
                            <div className="text-muted">
                                {getNumberOfBookingDays(booking)
                                    ? `${getNumberOfBookingDays(booking)} debiterade dagar / `
                                    : null}
                                {getNumberOfEventHours(booking)} arbetstimmar
                            </div>
                            <div className="text-muted">{booking.displayUsageInterval}</div>
                        </Card.Header>
                    </Card>
                    <Card className="mb-3">
                        <Card.Header>Prisinformation (ink. moms)</Card.Header>
                        <ListGroup variant="flush">
                            {booking.equipmentLists?.map((list) => (
                                <ListGroup.Item className="d-flex" key={list.id}>
                                    <span className="flex-grow-1">{list.name}</span>
                                    <span>{formatNumberAsCurrency(addVAT(getEquipmentListPrice(list)))}</span>
                                </ListGroup.Item>
                            ))}
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Personal (estimat)</span>
                                <span>
                                    {formatNumberAsCurrency(addVAT(getTotalTimeEstimatesPrice(booking.timeEstimates)))}
                                </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <strong className="flex-grow-1">Totalpris</strong>
                                <strong>{formatNumberAsCurrency(addVAT(getBookingPrice(booking, true)))}</strong>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <strong className="flex-grow-1">varav moms (25%)</strong>
                                <strong>
                                    {formatNumberAsCurrency(
                                        addVAT(getBookingPrice(booking, true)) - getBookingPrice(booking, true),
                                    )}
                                </strong>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                    <Card className="mb-3">
                        <Card.Header>Bokningsinformation</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Ansvarig</span>
                                <span>{booking.ownerUser?.name ?? '-'}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Plats</span>
                                <span>{booking.location}</span>
                            </ListGroup.Item>
                            {/* <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">coOwnerUsers</span>
                                <span>{booking.coOwnerUsers}</span>
                            </ListGroup.Item> */}
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Prisplan</span>
                                <span>{getPricePlanName(booking.pricePlan)}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Kontaktperson</span>
                                <span>{booking.contactPersonName}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Telefonnummer</span>
                                <span>{booking.contactPersonPhone}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Email</span>
                                <span>{booking.contactPersonEmail}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                    <Card className="mb-3">
                        <Card.Header>Fakturainformation</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Fakturaadress</span>
                                <span>{booking.invoiceAddress}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Fakturamärkning</span>
                                <span>{booking.invoiceTag}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Hogia-id</span>
                                <span>{booking.invoiceHogiaId}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Kontotyp</span>
                                <span>{getAccountKindName(booking.accountKind)}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                    <MarkdownCard
                        text={booking.note}
                        onSubmit={(note) => saveBooking({ note })}
                        cardTitle="Anteckningar"
                        readonly={currentUser.role === Role.READONLY || booking.status === Status.DONE}
                    />
                    <MarkdownCard
                        text={booking.returnalNote}
                        onSubmit={(returnalNote) => saveBooking({ returnalNote })}
                        cardTitle="Återlämningsanmärkning"
                        readonly={currentUser.role === Role.READONLY || booking.status === Status.DONE}
                    />
                    <ChangelogCard changelog={booking.changelog ?? []} />
                </Col>
            </Row>
        </Layout>
    );
};

export default BookingPage;
