import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Badge, Button, ButtonGroup, Card, Col, Dropdown, DropdownButton, ListGroup, Row } from 'react-bootstrap';
import {
    formatNullableDate,
    getAccountKindName,
    getPaymentStatusName,
    getPricePlanName,
    getResponseContentOrError,
    getStatusName,
} from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import Link from 'next/link';
import { IfAdmin, IfNotReadonly } from '../../../components/utils/IfAdmin';
import BookingTypeTag from '../../../components/utils/BookingTypeTag';
import { bookingFetcher } from '../../../lib/fetchers';
import TimeEstimateList from '../../../components/bookings/timeEstimate/TimeEstimateList';
import TimeReportList from '../../../components/bookings/timeReport/timeReportList';
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
import BookingChangelogCard from '../../../components/bookings/BookingChangelogCard';
import {
    formatNumberAsCurrency,
    getBookingPrice,
    getNumberOfBookingDays,
    getNumberOfEventHours,
    getUsageEndDatetime,
    getUsageStartDatetime,
} from '../../../lib/pricingUtils';
import BookingRentalStatusButton from '../../../components/bookings/BookingRentalStatusButton';
import { PartialDeep } from 'type-fest';
import { TimeEstimate, TimeReport } from '../../../models/interfaces';
import { getNextSortIndex } from '../../../lib/sortIndexUtils';
import TimeEstimateAddButton from '../../../components/bookings/timeEstimate/timeEstimateAddButton';
import TimeReportAddButton from '../../../components/bookings/timeReport/timeReportAddButton';
import RentalStatusTag from '../../../components/utils/RentalStatusTag';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const BookingPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { showSaveSuccessNotification, showSaveFailedNotification } = useNotifications();
    const [showTimeEstimateContent, setShowTimeEstimateContent] = useState(false);
    const [showTimeReportContent, setShowTimeReportContent] = useState(false);

    // Edit booking
    //
    const router = useRouter();
    const { data: booking, error, mutate } = useSwr('/api/bookings/' + router.query.id, bookingFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (!booking) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser}></TwoColLoadingPage>;
    }

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

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
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
                    <Button variant="dark" href={'/api/documents/price-estimate/sv/' + booking.id} target="_blank">
                        <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Prisuppskattning
                    </Button>

                    <Dropdown.Toggle split variant="dark" id="dropdown-split-basic" />

                    <Dropdown.Menu>
                        <Dropdown.Item href={'/api/documents/price-estimate/en/' + booking.id} target="_blank">
                            <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" /> Prisuppskattning (engelska)
                        </Dropdown.Item>
                        <Dropdown.Item href={'/api/documents/packing-list/sv/' + booking.id} target="_blank">
                            <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" /> Packlista
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <IfNotReadonly currentUser={currentUser}>
                    <TimeReportAddButton
                        booking={booking}
                        disabled={booking.status === Status.DONE}
                        sortIndex={getNextSortIndex(booking.timeEstimates ?? [])}
                        onAdd={onAddTimeReport}
                        currentUser={currentUser}
                        variant="dark"
                    >
                        <FontAwesomeIcon icon={faStopwatch} className="mr-1" />
                        Rapportera tid
                    </TimeReportAddButton>
                </IfNotReadonly>
                <IfNotReadonly currentUser={currentUser}>
                    <DropdownButton id="mer-dropdown-button" variant="dark" title="Mer">
                        <Dropdown.Item
                            onClick={() => saveBooking({ paymentStatus: PaymentStatus.PAID })}
                            disabled={
                                booking.paymentStatus === PaymentStatus.PAID ||
                                booking.paymentStatus === PaymentStatus.PAID_WITH_INVOICE
                            }
                        >
                            <FontAwesomeIcon icon={faCoins} className="mr-1 fw" /> Markera som betald
                        </Dropdown.Item>
                        <TimeEstimateAddButton
                            booking={booking}
                            disabled={booking.status === Status.DONE}
                            sortIndex={getNextSortIndex(booking.timeEstimates ?? [])}
                            onAdd={onAddTimeEstimate}
                            buttonType="dropdown"
                        >
                            <FontAwesomeIcon icon={faClock} className="mr-1 fw" />
                            Lägg till tidsuppskattning
                        </TimeEstimateAddButton>
                    </DropdownButton>
                </IfNotReadonly>
            </Header>

            <Row className="mb-3">
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
                            <div className="text-muted mt-2"> {booking.customerName}</div>
                            <div className="text-muted">
                                {getNumberOfBookingDays(booking) ?? 0} dagar / {getNumberOfEventHours(booking)} h /{' '}
                                {formatNumberAsCurrency(getBookingPrice(booking))}
                            </div>
                            {getUsageStartDatetime(booking) || getUsageEndDatetime(booking) ? (
                                <div className="text-muted">
                                    {formatNullableDate(getUsageStartDatetime(booking), 'N/A')} -{' '}
                                    {formatNullableDate(getUsageEndDatetime(booking), 'N/A')}
                                </div>
                            ) : null}
                        </Card.Header>

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

                    <Card className="mb-3">
                        <Card.Header>Anteckningar</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <div className="mb-1">Anteckning</div>
                                <div className="text-muted">{booking.note}</div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="mb-1">Återlämningsanmärkning</div>
                                <div className="text-muted">{booking.returnalNote}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <BookingChangelogCard changelog={booking.changelog ?? []} />
                </Col>
                <Col xl={8}>
                    <TimeEstimateList
                        showContent={showTimeEstimateContent}
                        setShowContent={setShowTimeEstimateContent}
                        bookingId={booking.id}
                        pricePlan={booking.pricePlan}
                        readonly={currentUser.role === Role.READONLY || booking.status === Status.DONE}
                    />
                    <TimeReportList
                        showContent={showTimeReportContent}
                        setShowContent={setShowTimeReportContent}
                        bookingId={booking.id}
                        pricePlan={booking.pricePlan}
                        currentUser={currentUser}
                        readonly={currentUser.role === Role.READONLY || booking.status === Status.DONE}
                    />
                    <EquipmentLists
                        bookingId={booking.id}
                        readonly={currentUser.role === Role.READONLY || booking.status === Status.DONE}
                    />
                </Col>
            </Row>
        </Layout>
    );
};

export default BookingPage;
