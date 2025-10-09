import React from 'react';
import Layout from '../../components/layout/Layout';
import Header from '../../components/layout/Header';
import useSwr from 'swr';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { bookingsFetcher } from '../../lib/fetchers';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { countNotNullorEmpty, getStatusColor, getStatusName } from '../../lib/utils';
import { formatDatetime, getBookingDateHeadingValue } from '../../lib/datetimeUtils';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { BookingsWithPotentialProblemsResult, getBookingsWithPotentialProblems } from '../../lib/bookingsWithPotentialProblemsUtils';
import { TableConfiguration, TableDisplay } from '../../components/TableDisplay';
import BookingStatusTag from '../../components/utils/BookingStatusTag';
import BookingTypeTag from '../../components/utils/BookingTypeTag';
import FixedPriceStatusTag from '../../components/utils/FixedPriceStatusTag';
import InternalReservationTag from '../../components/utils/InternalReservationTag';
import RentalStatusTag from '../../components/utils/RentalStatusTag';
import TableStyleLink from '../../components/utils/TableStyleLink';
import { HasId } from '../../models/interfaces/BaseEntity';
import WarningIcon from '../../components/utils/WarningIcon';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Bokningar med potentiella problem';
const breadcrumbs = [{ link: 'bookings', displayName: pageTitle }];

const BookingListPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { data: bookings, error } = useSwr('/api/bookings', bookingsFetcher);

    const bookingsWithPotentialProblems = getBookingsWithPotentialProblems(bookings ?? []);
    const bookingsWithPotentialProblemsWithId = bookingsWithPotentialProblems.map((x) => ({ ...x, id: x.booking.id }));

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

    if (!bookings) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

     const BookingNameDisplayFn = (x: BookingsWithPotentialProblemsResult) => (
        <>
              <TableStyleLink href={'/bookings/' + x.booking.id}>{x.booking.name}</TableStyleLink>

        <BookingStatusTag booking={x.booking} className="ml-1" />
        <BookingTypeTag booking={x.booking} className="ml-1" />
        <RentalStatusTag booking={x.booking} className="ml-1" />
        <InternalReservationTag booking={x.booking} className="ml-1" />
        <FixedPriceStatusTag booking={x.booking} className="ml-1" />
        <p className="text-muted mb-0">{x.booking.customerName ?? '-'}</p>
        </>
    );

    const BookingUsageIntervalDisplayFn = (x: BookingsWithPotentialProblemsResult) => (
        <>
            <p className="mb-0">{x.booking.displayUsageInterval}</p>
            {x.booking.displayUsageInterval !== x.booking.displayEquipmentOutInterval ? (
                <p className="text-muted mb-0">{x.booking.displayEquipmentOutInterval}</p>
            ) : null}
        </>
    );

    const BookingProblemsDisplayFn = (result: BookingsWithPotentialProblemsResult) => (
        <>
            {result.shouldBeBooked ? (
                <p className="mb-1">
                    Inte markerat som bokad
                    <WarningIcon
                        className="ml-2"
                        text={`Denna bokning lämnas ut ${formatDatetime(result.booking.equipmentOutDatetime)} och är fortfarande inte markerad som bokad.`}
                    />
                </p>
            ) : null}
            {result.shouldBeDone ? (
                <p className="mb-1">
                    Inte klarmarkerad
                    <WarningIcon
                        className="ml-2"
                        text={`Denna bokning återlämnades ${formatDatetime(result.booking.equipmentInDatetime)} och är fortfarande inte klarmarkerad.`}
                    />
                </p>
            ) : null}
            {result.shouldBeOut.length > 0 ? (
                <p className="mb-1">
                    Inte utlämnad
                    <WarningIcon
                        className="ml-2"
                        text={`Denna bokning har utrustningslistor som borde ha lämnats ut men som inte markerats som utlämnade (${result.shouldBeOut.map((x) => x.name).join(', ')}).`}
                    />
                </p>
            ) : null}
            {result.shouldBeIn.length > 0 ? (
                <p className="mb-1">
                    Inte återlämnad
                    <WarningIcon
                        className="ml-2"
                        text={`Denna bokning har utrustningslistor som borde ha återlämnats men som inte markerats som återlämnade (${result.shouldBeIn.map((x) => x.name).join(', ')}).`}
                    />
                </p>
            ) : null}
        </>
    );

    const tableSettings: TableConfiguration<BookingsWithPotentialProblemsResult & HasId> = {
        entityTypeDisplayName: 'bokningar',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        statusColumns: [
            {
                key: 'status',
                getValue: (x: BookingsWithPotentialProblemsResult) => getStatusName(x.booking.status),
                getColor: (x: BookingsWithPotentialProblemsResult) => getStatusColor(x.booking.status),
            },
        ],
        columns: [
{
            key: 'name',
            displayName: 'Bokning',
            getValue: (x: BookingsWithPotentialProblemsResult) => x.booking.name,
            getContentOverride: BookingNameDisplayFn,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (x: BookingsWithPotentialProblemsResult) => x.booking.isoFormattedUsageStartString,
            getHeadingValue: x => getBookingDateHeadingValue(x.booking),
            getContentOverride: BookingUsageIntervalDisplayFn,
        },
        {
            key: 'ownerUser',
            displayName: 'Ansvarig',
            getValue: (x: BookingsWithPotentialProblemsResult) => x.booking.ownerUser?.name ?? '-',
            getHeadingValue: (booking: BookingsWithPotentialProblemsResult) => booking.booking.ownerUser?.name ?? '-',
            cellHideSize: 'lg',
            columnWidth: 180,
        },
        {
            key: 'problem',
            displayName: 'Potentiella problem',
            getValue: (x: BookingsWithPotentialProblemsResult) => countNotNullorEmpty(x.shouldBeBooked, x.shouldBeDone, x.shouldBeOut, x.shouldBeIn),
            getContentOverride: BookingProblemsDisplayFn,
            columnWidth: 220,
        },
        ],
    };

    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs} />
            <TableDisplay entities={bookingsWithPotentialProblemsWithId} configuration={tableSettings} />
        </Layout>
    );
};

export default BookingListPage;
