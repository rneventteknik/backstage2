import React, { ChangeEvent, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Booking } from '../../models/interfaces';
import useSwr from 'swr';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import BookingTypeTag from '../../components/utils/BookingTypeTag';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { validDate, formatDate, getStatusName, notEmpty, onlyUnique, onlyUniqueById } from '../../lib/utils';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Button, Col, Collapse, Form } from 'react-bootstrap';
import { Status } from '../../models/enums/Status';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faFilter } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/layout/Header';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { bookingsFetcher } from '../../lib/fetchers';
import TableStyleLink from '../../components/utils/TableStyleLink';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { IfNotReadonly } from '../../components/utils/IfAdmin';
import Link from 'next/link';

interface BookingViewModel extends Booking {
    displayDate: string;
}

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Bokningar';
const breadcrumbs = [{ link: 'bookings', displayName: pageTitle }];

const BookingNameDisplayFn = (booking: BookingViewModel) => (
    <>
        <TableStyleLink href={'bookings/' + booking.id}>{booking.name}</TableStyleLink>

        <BookingTypeTag booking={booking} className="ml-1" />
        <p className="text-muted mb-0">{getStatusName(booking.status)}</p>
        <p className="text-muted mb-0 d-lg-none">{booking.ownerUser?.name ?? '-'}</p>
        <p className="text-muted mb-0 d-sm-none">{booking.displayDate}</p>
    </>
);

const tableSettings: TableConfiguration<BookingViewModel> = {
    entityTypeDisplayName: 'bokningar',
    defaultSortPropertyName: 'date',
    defaultSortAscending: false,
    hideTableFilter: true,
    columns: [
        {
            key: 'name',
            displayName: 'Bokning',
            getValue: (booking: BookingViewModel) => booking.name,
            textTruncation: true,
            getContentOverride: BookingNameDisplayFn,
        },
        {
            key: 'customerName',
            displayName: 'Beställare',
            getValue: (booking: BookingViewModel) => booking.customerName ?? '-',
            textTruncation: true,
        },
        {
            key: 'location',
            displayName: 'Plats',
            getValue: (booking: BookingViewModel) => booking.location ?? '-',
            textAlignment: 'center',
            cellHideSize: 'xl',
            columnWidth: 180,
        },
        {
            key: 'ownerUser',
            displayName: 'Ansvarig',
            getValue: (booking: BookingViewModel) => booking.ownerUser?.name ?? '-',
            textAlignment: 'center',
            cellHideSize: 'lg',
            columnWidth: 180,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (booking: BookingViewModel) => booking.displayDate,
            columnWidth: 180,
            textAlignment: 'center',
            cellHideSize: 'sm',
        },
    ],
};

const BookingListPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: bookings, error, isValidating } = useSwr('/api/bookings', fetcher);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [userIds, setUserIds] = useState<(number | undefined)[]>([]);
    const [statuses, setStatuses] = useState<(Status | undefined)[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !bookings) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} />;
    }

    // Generate option lists for filters
    //
    const statusOptions = bookings
        .map((x) => x.status)
        .filter(notEmpty)
        .filter(onlyUnique)
        .map((status) => ({ label: getStatusName(status), value: status }));

    const ownerUserOptions = bookings
        .map((x) => x.ownerUser)
        .filter(notEmpty)
        .filter(onlyUniqueById)
        .map((user) => ({ label: user.name, value: user.id }));

    // Handlers for changed bookings
    //
    const handleChangeFilterString = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const handleChangeStartDate = (event: ChangeEvent<HTMLInputElement>) => {
        setStartDate(new Date(event.target.value));
    };

    const handleChangeEndDate = (event: ChangeEvent<HTMLInputElement>) => {
        setEndDate(new Date(event.target.value));
    };

    // Filter list. Note that the free text filter are handled by the table and not here.
    //
    const bookingsToShow = bookings
        .filter((booking: Booking) => userIds.length === 0 || userIds.indexOf(booking.ownerUser?.id) >= 0)
        .filter((booking: Booking) => statuses.length === 0 || statuses.indexOf(booking.status) >= 0)
        .filter(
            (booking: Booking) =>
                !startDate || !validDate(startDate) || (booking.created && booking.created > startDate),
        )
        .filter(
            (booking: Booking) => !endDate || !validDate(endDate) || (booking.created && booking.created < endDate),
        );

    return (
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href="/bookings/new" passHref>
                        <Button variant="primary" as="span">
                            <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till bokning
                        </Button>
                    </Link>
                </IfNotReadonly>
            </Header>

            <Form.Row>
                <Col>
                    <Form.Group>
                        <Form.Control type="text" placeholder="Fritextfilter" onChange={handleChangeFilterString} />
                    </Form.Group>
                </Col>
                <Col md="auto">
                    <Form.Group>
                        <Button variant="dark" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                            <FontAwesomeIcon icon={faFilter} /> {showAdvancedFilters ? 'Göm' : 'Visa'} filter
                        </Button>
                    </Form.Group>
                </Col>
            </Form.Row>

            <Collapse in={showAdvancedFilters}>
                <Form.Row className="mb-2">
                    <Col md="4">
                        <Form.Group>
                            <Form.Label>Status</Form.Label>
                            <Typeahead<{ label: string; value: Status }>
                                id="status-typeahead"
                                multiple
                                labelKey={(x) => x.label}
                                options={statusOptions}
                                onChange={(e) => setStatuses(e.map((o) => o.value))}
                                placeholder="Filtrera på status"
                            />
                        </Form.Group>
                    </Col>
                    <Col md="4">
                        <Form.Group>
                            <Form.Label>Ansvarig</Form.Label>
                            <Typeahead<{ label: string; value: Status }>
                                id="user-typeahead"
                                multiple
                                labelKey={(x) => x.label}
                                options={ownerUserOptions}
                                onChange={(e) => setUserIds(e.map((o) => o.value))}
                                placeholder="Filtrera på ansvarig"
                            />
                        </Form.Group>
                    </Col>
                    <Col md="2">
                        <Form.Group>
                            <Form.Label>Skapad Efter</Form.Label>
                            <Form.Control type="date" onChange={handleChangeStartDate} />
                        </Form.Group>
                    </Col>
                    <Col md="2">
                        <Form.Group>
                            <Form.Label>Skapad Före</Form.Label>
                            <Form.Control type="date" onChange={handleChangeEndDate} />
                        </Form.Group>
                    </Col>
                </Form.Row>
            </Collapse>

            <TableDisplay entities={bookingsToShow} configuration={tableSettings} filterString={searchText} />
        </Layout>
    );
};

// Calculating date formats are expensive, so precalculate the date string to increase performace.
const fetcher = (url: string) =>
    bookingsFetcher(url).then((bookings) =>
        bookings.map((booking) => ({
            ...booking,
            displayDate: booking.created ? formatDate(new Date(booking.created)) : '-',
        })),
    );

export default BookingListPage;
