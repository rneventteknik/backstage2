import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, ButtonGroup, Card, Col, Dropdown, DropdownButton, ListGroup, Row } from 'react-bootstrap';
import {
    getAccountKindName,
    getDefaultLaborHourlyRate,
    getPricePlanName,
    getResponseContentOrError,
    getOperationalYear,
} from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
import Link from 'next/link';
import { IfAdmin, IfNotReadonly } from '../../../components/utils/IfAdmin';
import { bookingFetcher } from '../../../lib/fetchers';
import TimeEstimateList from '../../../components/bookings/timeEstimate/TimeEstimateList';
import TimeReportList from '../../../components/bookings/timeReport/TimeReportList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import {
    faCoins,
    faFileDownload,
    faFilePdf,
    faFileText,
    faLock,
    faLockOpen,
    faPen,
    faTimesCircle,
    faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
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
    getTotalTimeReportsPrice,
    getVAT,
} from '../../../lib/pricingUtils';
import BookingRentalStatusButton from '../../../components/bookings/BookingRentalStatusButton';
import { PartialDeep } from 'type-fest';
import { formatDateForForm, toBookingViewModel } from '../../../lib/datetimeUtils';
import { KeyValue } from '../../../models/interfaces/KeyValue';
import MarkdownCard from '../../../components/MarkdownCard';
import ToggleCoOwnerButton from '../../../components/bookings/ToggleCoOwnerButton';
import ConfirmModal from '../../../components/utils/ConfirmModal';
import BookingInfoSection from '../../../components/bookings/BookingInfoSection';
import FilesCard from '../../../components/bookings/FilesCard';
import currency from 'currency.js';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const BookingPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { showSaveSuccessNotification, showSaveFailedNotification, showGeneralDangerMessage } = useNotifications();

    // Enable this when we enable the KårX feature
    // const [showConfirmReadyForCashPaymentModal, setShowConfirmReadyForCashPaymentModal] = useState(false);
    const [showConfirmPaidModal, setShowConfirmPaidModal] = useState(false);
    const [adminEditModeOverrideEnabled, setAdminEditModeOverrideEnabled] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

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

    // Cancel booking handler
    //
    const cancelBooking = () => {
        saveBooking({ status: Status.CANCELED });
        setShowCancelModal(false);
    };

    // Delete booking handler
    //
    const deleteBooking = () => {
        setShowDeleteModal(false);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/bookings/' + booking?.id, request)
            .then(getResponseContentOrError)
            .then(() => router.push('/bookings/'))
            .catch((error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Bokningen kunde inte tas bort');
            });
    };

    // The page itself
    //
    const pageTitle = booking?.name;
    const breadcrumbs = [
        { link: '/bookings', displayName: 'Bokningar' },
        { link: '/bookings/' + booking.id, displayName: pageTitle },
    ];

    const defaultLaborHourlyRate = getDefaultLaborHourlyRate(booking.pricePlan, globalSettings);

    const readonly =
        (currentUser.role === Role.READONLY || booking.status === Status.DONE) && !adminEditModeOverrideEnabled;
    const timeReportExists = booking.timeReports && booking.timeReports.length > 0;

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                {!readonly ? (
                    <>
                        <Link href={'/bookings/' + booking.id + '/edit'} passHref legacyBehavior>
                            <Button variant="primary" href={'/bookings/' + booking.id + '/edit'}>
                                <FontAwesomeIcon icon={faPen} className="mr-1" /> Redigera
                            </Button>
                        </Link>

                        <BookingStatusButton booking={booking} onChange={saveBooking} />
                        <BookingRentalStatusButton booking={booking} onChange={saveBooking} />
                    </>
                ) : null}
                <Dropdown as={ButtonGroup}>
                    <Dropdown.Toggle variant="secondary" id="dropdown-split-basic">
                        <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" />
                        Exportera
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item
                            href={`/api/documents/price-estimate/${booking.language}/${booking.id}`}
                            target="_blank"
                        >
                            <FontAwesomeIcon icon={faFilePdf} className="mr-1 fa-fw" /> Prisuppskattning
                        </Dropdown.Item>
                        <Dropdown.Item href={`/api/documents/packing-list/sv/${booking.id}`} target="_blank">
                            <FontAwesomeIcon icon={faFilePdf} className="mr-1 fa-fw" /> Packlista
                        </Dropdown.Item>
                        <Dropdown.Item
                            href={`/api/documents/rental-agreement/${booking.language}/${booking.id}`}
                            target="_blank"
                        >
                            <FontAwesomeIcon icon={faFilePdf} className="mr-1 fa-fw" /> Hyresavtal
                        </Dropdown.Item>
                        <IfAdmin currentUser={currentUser}>
                            <Dropdown.Divider />
                        </IfAdmin>
                        <Dropdown.Item
                            href={`/api/documents/invoice/pdf/${booking.language}/${booking.id}`}
                            target="_blank"
                        >
                            <FontAwesomeIcon icon={faFilePdf} className="mr-1 fa-fw" /> Fakturaunderlag (PDF)
                        </Dropdown.Item>
                        <IfAdmin currentUser={currentUser}>
                            <Dropdown.Item
                                href={`/api/documents/invoice/txt/${booking.language}/${booking.id}?download=true`}
                                target="_blank"
                            >
                                <FontAwesomeIcon icon={faFileText} className="mr-1 fa-fw" /> Fakturaunderlag (Hogia
                                import)
                            </Dropdown.Item>
                        </IfAdmin>
                    </Dropdown.Menu>
                </Dropdown>
                <ToggleCoOwnerButton booking={booking} currentUser={currentUser} variant="secondary" />
                <IfNotReadonly
                    currentUser={currentUser}
                    and={booking.status === Status.DONE && booking.paymentStatus === PaymentStatus.NOT_PAID}
                >
                    {/*

                    Note: Enable this code once pating is KårX is available
                    
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
                    </ConfirmModal> */}

                    <Button variant="secondary" onClick={() => setShowConfirmPaidModal(true)}>
                        <FontAwesomeIcon icon={faCoins} className="mr-1 fw" /> Markera som skall ej faktureras
                    </Button>
                    <ConfirmModal
                        show={showConfirmPaidModal}
                        onHide={() => setShowConfirmPaidModal(false)}
                        onConfirm={() => {
                            updateBookingPaymentStatus(PaymentStatus.PAID);
                            setShowConfirmPaidModal(false);
                        }}
                        title="Bekräfta"
                        confirmLabel="Markera som skall ej faktureras"
                        confirmButtonType="primary"
                    >
                        Vill du markera bokningen <em>{booking.name}</em> som skall ej faktureras?
                    </ConfirmModal>
                </IfNotReadonly>

                {currentUser.role === Role.ADMIN && booking.status === Status.DONE ? (
                    <Button variant="secondary" onClick={() => setAdminEditModeOverrideEnabled((x) => !x)}>
                        <FontAwesomeIcon
                            icon={adminEditModeOverrideEnabled ? faLock : faLockOpen}
                            className="mr-1 fw"
                        />{' '}
                        {adminEditModeOverrideEnabled
                            ? 'Sluta redigera klarmarkerad bokning'
                            : 'Redigera klarmarkerad bokning'}
                    </Button>
                ) : null}

                {!readonly ? (
                    <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                        {booking.status !== Status.CANCELED && booking.status !== Status.DONE ? (
                            <Dropdown.Item onClick={() => setShowCancelModal(true)}>
                                <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Ställ in bokningen
                            </Dropdown.Item>
                        ) : null}
                        <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                            <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort bokningen
                        </Dropdown.Item>
                    </DropdownButton>
                ) : null}

                <ConfirmModal
                    show={showCancelModal}
                    onHide={() => setShowCancelModal(false)}
                    title="Bekräfta"
                    confirmLabel="Ställ in"
                    confirmButtonType="primary"
                    onConfirm={cancelBooking}
                >
                    Vill du verkligen ställa in bokningen {booking.name}?
                </ConfirmModal>
                <ConfirmModal
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    title="Bekräfta"
                    confirmLabel="Ta bort"
                    onConfirm={deleteBooking}
                >
                    <p>Vill du verkligen ta bort bokningen {booking.name}?</p>
                    <p className="mb-0">
                        Om bokningen inte skapats av misstag kan det vara lämpligare att ställa in den istället.
                    </p>
                </ConfirmModal>
            </Header>

            <Row className="mb-3">
                <Col xl={8}>
                    <BookingInfoSection booking={booking} showName={false} className="d-xl-none mb-3" />
                    <TimeEstimateList
                        bookingId={booking.id}
                        pricePlan={booking.pricePlan}
                        readonly={readonly}
                        defaultLaborHourlyRate={defaultLaborHourlyRate}
                    />
                    <TimeReportList
                        bookingId={booking.id}
                        pricePlan={booking.pricePlan}
                        currentUser={currentUser}
                        readonly={readonly}
                        defaultLaborHourlyRate={defaultLaborHourlyRate}
                    />
                    <EquipmentLists
                        bookingId={booking.id}
                        readonly={readonly}
                        globalSettings={globalSettings}
                        defaultLaborHourlyRate={defaultLaborHourlyRate}
                    />
                </Col>
                <Col xl={4}>
                    <BookingInfoSection booking={booking} className="d-none d-xl-block mb-3" />
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
                                <span className="flex-grow-1">Estimerad personalkostnad</span>
                                <span>
                                    {formatNumberAsCurrency(addVAT(getTotalTimeEstimatesPrice(booking.timeEstimates)))}
                                </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <strong className="flex-grow-1">Pris med estimerad personalkostnad</strong>
                                <strong>{formatNumberAsCurrency(addVAT(getBookingPrice(booking, true, true)))}</strong>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <em className="flex-grow-1 pl-4">varav moms (25%)</em>
                                <em>{formatNumberAsCurrency(getVAT(getBookingPrice(booking, true, true)))}</em>
                            </ListGroup.Item>
                            {timeReportExists ? (
                                <>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Faktisk personalkostnad</span>
                                        <span>
                                            {formatNumberAsCurrency(
                                                addVAT(getTotalTimeReportsPrice(booking.timeReports)),
                                            )}
                                        </span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <strong className="flex-grow-1">Pris med faktisk personalkostnad</strong>
                                        <strong>
                                            {formatNumberAsCurrency(addVAT(getBookingPrice(booking, false, true)))}
                                        </strong>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <em className="flex-grow-1 pl-4">varav moms (25%)</em>
                                        <em>{formatNumberAsCurrency(getVAT(getBookingPrice(booking, false, true)))}</em>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Skillnad mot estimerad personalkostnad</span>
                                        <span>
                                            {formatNumberAsCurrency(
                                                addVAT(
                                                    getBookingPrice(booking, false, true).subtract(
                                                        getBookingPrice(booking, true, true),
                                                    ),
                                                ),
                                                true,
                                            )}
                                        </span>
                                    </ListGroup.Item>
                                </>
                            ) : null}
                            {booking.fixedPrice !== null && booking.fixedPrice !== undefined ? (
                                <>
                                    <ListGroup.Item className="d-flex">
                                        <strong className="flex-grow-1">Fast pris</strong>
                                        <strong>{formatNumberAsCurrency(addVAT(booking.fixedPrice))}</strong>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <em className="flex-grow-1 pl-4">varav moms (25%)</em>
                                        <em>{formatNumberAsCurrency(getVAT(booking.fixedPrice))}</em>
                                    </ListGroup.Item>
                                    {timeReportExists ? (
                                        <ListGroup.Item className="d-flex">
                                            <span className="flex-grow-1">
                                                Skillnad mot pris med faktisk personalkostnad
                                            </span>
                                            <span>
                                                {formatNumberAsCurrency(
                                                    addVAT(
                                                        currency(booking.fixedPrice).subtract(
                                                            getBookingPrice(booking, false, true),
                                                        ),
                                                    ),
                                                    true,
                                                )}
                                            </span>
                                        </ListGroup.Item>
                                    ) : (
                                        <ListGroup.Item className="d-flex">
                                            <span className="flex-grow-1">
                                                Skillnad mot pris med estimerad personalkostnad
                                            </span>
                                            <span>
                                                {formatNumberAsCurrency(
                                                    addVAT(
                                                        currency(booking.fixedPrice).subtract(
                                                            getBookingPrice(booking, true, true),
                                                        ),
                                                    ),
                                                    true,
                                                )}
                                            </span>
                                        </ListGroup.Item>
                                    )}
                                </>
                            ) : null}
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
                        readonly={readonly}
                    />
                    <FilesCard
                        driveFolderId={booking.driveFolderId}
                        defaultFolderName={`${formatDateForForm(booking.usageStartDatetime, 'N/A')} ${booking.name}`}
                        defaultParentFolder={getOperationalYear(booking.usageStartDatetime)}
                        onSubmit={(driveFolderId) => saveBooking({ driveFolderId })}
                        readonly={readonly}
                    />

                    <MarkdownCard
                        text={booking.returnalNote}
                        onSubmit={(returnalNote) => saveBooking({ returnalNote })}
                        cardTitle="Återlämningsanmärkning"
                        readonly={readonly}
                    />
                    <ChangelogCard changelog={booking.changelog ?? []} />
                </Col>
            </Row>
        </Layout>
    );
};

export default BookingPage;
