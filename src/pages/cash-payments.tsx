import { faCheck, faFileDownload, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import React, { useState } from 'react';
import { Alert, Button, Dropdown, Navbar } from 'react-bootstrap';
import useSwr from 'swr';
import { TableConfiguration, TableDisplay } from '../components/TableDisplay';
import ActivityIndicator from '../components/utils/ActivityIndicator';
import ConfirmModal from '../components/utils/ConfirmModal';
import DoneIcon from '../components/utils/DoneIcon';
import { IfCashPaymentManager, IfNotCashPaymentManager } from '../components/utils/IfAdmin';
import TableStyleLink from '../components/utils/TableStyleLink';
import UserDisplay from '../components/utils/UserDisplay';
import UserIcon from '../components/utils/UserIcon';
import { bookingsFetcher } from '../lib/fetchers';
import { addVAT, formatNumberAsCurrency, getBookingPrice } from '../lib/pricingUtils';
import { useNotifications } from '../lib/useNotifications';
import { useUser } from '../lib/useUser';
import { getGlobalSetting, getResponseContentOrError } from '../lib/utils';
import { PaymentStatus } from '../models/enums/PaymentStatus';
import { Role } from '../models/enums/Role';
import { Booking } from '../models/interfaces';
import { KeyValue } from '../models/interfaces/KeyValue';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';

const containerStyle = {
    margin: 'auto',
    marginTop: '8rem',
    width: 1200,
    maxWidth: '100%',
    padding: '2rem',
};

const pageTitle = 'Bokningar att betala';
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUser('/login', '/', undefined, false, Role.CASH_PAYMENT_MANAGER);

const CashPaymentsPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const {
        data: bookings,
        error,
        isValidating,
    } = useSwr('/api/bookings/paymentStatus/readyForCashPayment', bookingsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    const {
        data: paidBookings,
        error: paidBookingsError,
        isValidating: paidBookingsIsValidating,
    } = useSwr('/api/bookings/paymentStatus/paidWithCash', bookingsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    const [confirmingBookingId, setConfirmingBookingId] = useState<number | null>(null);
    const [confirmedBookingIds, setConfirmingBookingIds] = useState<number[]>([]);
    const { showGeneralSuccessMessage, showGeneralDangerMessage } = useNotifications();

    if ((!bookings && !error && isValidating) || (!paidBookings && !paidBookings && paidBookingsIsValidating)) {
        return (
            <div style={containerStyle}>
                <h1> {pageTitle} </h1>
                <hr />
                <div className="text-center py-5">
                    <ActivityIndicator />
                </div>
            </div>
        );
    }

    if (error || !bookings || paidBookingsError || !paidBookings) {
        return (
            <div style={containerStyle}>
                <h1> {pageTitle} </h1>
                <hr />
                <Alert variant="danger">
                    <strong> Fel </strong> Prislistan kunde inte hämtas. Försök igen senare.
                </Alert>
            </div>
        );
    }

    const markBookingAsPaidWithCashPayment = (bookingId: number | null, undo = false) => {
        if (bookingId === null) {
            throw new Error('Invalid booking id');
        }

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch(
            '/api/bookings/paymentStatus/' +
                bookingId +
                '?status=' +
                (undo ? PaymentStatus.READY_FOR_CASH_PAYMENT : PaymentStatus.PAID_WITH_CASH),
            request,
        )
            .then((apiResponse) => getResponseContentOrError(apiResponse))
            .then(() => {
                undo
                    ? setConfirmingBookingIds((x) => x.filter((id) => id !== bookingId))
                    : setConfirmingBookingIds((x) => [bookingId, ...x]);
                showGeneralSuccessMessage(undo ? 'Markering ångrad' : 'Markerad som betald');
            })
            .catch((error: Error) => {
                console.error(error);
                showGeneralDangerMessage('Någonting gick fel');
            });
    };

    const logOut = async () => {
        const res = await fetch('/api/users/logout');
        if (res.status === 200) {
            Router.push('/login');
        }
    };

    const BookingNameDisplayFn = (booking: Booking) => (
        <>
            <IfNotCashPaymentManager currentUser={currentUser}>
                <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>
            </IfNotCashPaymentManager>
            <IfCashPaymentManager currentUser={currentUser}>{booking.name}</IfCashPaymentManager>
            <p className="text-muted mb-0">{booking.customerName ?? '-'}</p>
            <p className="text-muted mb-0">{booking.contactPersonName ?? '-'}</p>
        </>
    );

    const BookingStatusDisplayFn = (booking: Booking) =>
        booking.paymentStatus === PaymentStatus.PAID_WITH_CASH || confirmedBookingIds.includes(booking.id) ? (
            <span>
                Klar <DoneIcon />
            </span>
        ) : (
            <span>Ska betalas</span>
        );

    const BookingPriceDisplayFn = (booking: Booking) => (
        <>
            <span style={{ fontSize: '1.2em' }} className="text-monospace">
                {formatNumberAsCurrency(addVAT(getBookingPrice(booking)))}
            </span>
        </>
    );

    const BookingActionsDisplayFn = (booking: Booking) => (
        <>
            <Button
                variant="secondary"
                size="sm"
                className="mr-2"
                href={`/api/documents/price-estimate/${booking.language}/${booking.id}`}
                target="_blank"
            >
                <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Visa prisunderlag
            </Button>

            {confirmedBookingIds.includes(booking.id) ? (
                <Button
                    variant="secondary"
                    size="sm"
                    className="mr-2"
                    onClick={() => markBookingAsPaidWithCashPayment(booking.id, true)}
                >
                    <FontAwesomeIcon icon={faRotateLeft} className="mr-1" /> Ångra
                </Button>
            ) : (
                <Button variant="primary" size="sm" className="mr-2" onClick={() => setConfirmingBookingId(booking.id)}>
                    <FontAwesomeIcon icon={faCheck} className="mr-1" /> Markera som betald
                </Button>
            )}
        </>
    );

    const tableSettings: TableConfiguration<Booking> = {
        entityTypeDisplayName: 'bokningar',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Bokning',
                getValue: (booking: Booking) =>
                    booking.name + ' ' + booking.customerName + ' ' + booking.contactPersonName,
                textTruncation: true,
                getContentOverride: BookingNameDisplayFn,
            },
            {
                key: 'status',
                displayName: 'Status',
                disableSort: true,
                getValue: () => '',
                getContentOverride: BookingStatusDisplayFn,
                columnWidth: 120,
            },
            {
                key: 'amount',
                displayName: 'Att betala (inklusive moms)',
                getValue: (booking: Booking) => getBookingPrice(booking).value,
                textTruncation: true,
                getContentOverride: BookingPriceDisplayFn,
                columnWidth: 200,
            },
            {
                key: 'actions',
                displayName: '',
                disableSort: true,
                getValue: () => '',
                getContentOverride: BookingActionsDisplayFn,
                columnWidth: 350,
                textAlignment: 'center',
            },
        ],
    };

    const paidBookingsTableSettings: TableConfiguration<Booking> = {
        entityTypeDisplayName: 'bokningar',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Bokning',
                getValue: (booking: Booking) =>
                    booking.name + ' ' + booking.customerName + ' ' + booking.contactPersonName,
                textTruncation: true,
                getContentOverride: BookingNameDisplayFn,
            },
            {
                key: 'status',
                displayName: 'Status',
                disableSort: true,
                getValue: () => '',
                getContentOverride: BookingStatusDisplayFn,
                columnWidth: 120,
            },
            {
                key: 'amount',
                displayName: 'Betalat (inklusive moms)',
                getValue: (booking: Booking) => getBookingPrice(booking).value,
                textTruncation: true,
                getContentOverride: BookingPriceDisplayFn,
                columnWidth: 200,
            },
            {
                key: 'actions',
                displayName: '',
                disableSort: true,
                getValue: () => '',
                columnWidth: 350,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <>
            <Head>
                <title>{pageTitle} | Backstage2</title>
                <meta charSet="utf-8" />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href={getGlobalSetting('content.image.favIcon', globalSettings, '')}
                />
            </Head>{' '}
            <Navbar variant="dark" fixed="top">
                <div className="flex-grow-1"></div>
                <Dropdown>
                    <Dropdown.Toggle variant="default" id="dropdown-basic" className="py-0" aria-label="User Menu">
                        <UserIcon user={currentUser} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu align="right">
                        <Dropdown.Item disabled={true}>
                            <UserDisplay user={currentUser} />
                        </Dropdown.Item>
                        <IfNotCashPaymentManager currentUser={currentUser}>
                            <Link href={'/'} passHref>
                                <Dropdown.Item href={'/'}>Tillbaka till Backstage2</Dropdown.Item>
                            </Link>
                        </IfNotCashPaymentManager>
                        <Dropdown.Item onClick={logOut}>Logga ut</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar>
            <div style={containerStyle}>
                <h1>{pageTitle}</h1>
                {bookings.length > 0 ? (
                    <TableDisplay entities={bookings} configuration={{ ...tableSettings }} />
                ) : (
                    <span className="text-center font-italic text-muted">Just nu finns inga bokningar att betala.</span>
                )}

                <h1 className="mt-5">Betalda bokningar</h1>
                {paidBookings.length > 0 ? (
                    <TableDisplay entities={paidBookings} configuration={{ ...paidBookingsTableSettings }} />
                ) : (
                    <span className="text-center font-italic text-muted">Det finns inga betala bokningar.</span>
                )}

                <ConfirmModal
                    show={confirmingBookingId !== null}
                    onHide={() => setConfirmingBookingId(null)}
                    onConfirm={() => {
                        markBookingAsPaidWithCashPayment(confirmingBookingId);
                        setConfirmingBookingId(null);
                    }}
                    title="Bekräfta"
                    confirmLabel="Markera som betald"
                    confirmButtonType="primary"
                >
                    Vill du verkligen markera bokningen {bookings.find((b) => b.id === confirmingBookingId)?.name} av{' '}
                    {bookings.find((b) => b.id === confirmingBookingId)?.customerName} (
                    {bookings.find((b) => b.id === confirmingBookingId)?.contactPersonName}) som betald?
                </ConfirmModal>
            </div>
        </>
    );
};

export default CashPaymentsPage;
