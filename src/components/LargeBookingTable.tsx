import React, { ChangeEvent } from 'react';
import { BookingViewModel } from '../models/interfaces';
import BookingTypeTag from '../components/utils/BookingTypeTag';
import { TableDisplay, TableConfiguration } from '../components/TableDisplay';
import { countNullorEmpty, getStatusColor, getStatusName, notEmpty, onlyUnique, onlyUniqueById } from '../lib/utils';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Col, Form } from 'react-bootstrap';
import { Status } from '../models/enums/Status';
import TableStyleLink from '../components/utils/TableStyleLink';
import RentalStatusTag from './utils/RentalStatusTag';
import { formatDateForForm, getBookingDateHeadingValue, validDate } from '../lib/datetimeUtils';
import { useLocalStorageState, useLocalStorageStateForDate } from '../lib/useLocalStorageState';
import AdvancedFilters from './AdvancedFilters';
import BookingStatusTag from './utils/BookingStatusTag';

const BookingNameDisplayFn = (booking: BookingViewModel) => (
    <>
        <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>

        <BookingStatusTag booking={booking} className="ml-1" />
        <BookingTypeTag booking={booking} className="ml-1" />
        <RentalStatusTag booking={booking} className="ml-1" />
        <p className="text-muted mb-0">{booking.customerName ?? '-'}</p>
    </>
);

const BookingUsageIntervalDisplayFn = (booking: BookingViewModel) => (
    <>
        <p className="mb-0">{booking.displayUsageInterval}</p>
        {booking.displayUsageInterval !== booking.displayEquipmentOutInterval ? (
            <p className="text-muted mb-0">{booking.displayEquipmentOutInterval}</p>
        ) : null}
    </>
);

const tableSettings: TableConfiguration<BookingViewModel> = {
    entityTypeDisplayName: 'bokningar',
    defaultSortPropertyName: 'date',
    defaultSortAscending: false,
    hideTableFilter: true,
    statusColumns: [
        {
            key: 'status',
            getValue: (booking: BookingViewModel) => getStatusName(booking.status),
            getColor: (booking: BookingViewModel) => getStatusColor(booking.status),
        },
    ],
    columns: [
        {
            key: 'name',
            displayName: 'Bokning',
            getValue: (booking: BookingViewModel) => booking.name,
            getContentOverride: BookingNameDisplayFn,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (booking: BookingViewModel) => booking.isoFormattedUsageStartString,
            getHeadingValue: getBookingDateHeadingValue,
            getContentOverride: BookingUsageIntervalDisplayFn,
        },
        {
            key: 'location',
            displayName: 'Plats',
            getValue: (booking: BookingViewModel) => booking.location ?? '-',
            cellHideSize: 'xl',
            columnWidth: 180,
        },
        {
            key: 'ownerUser',
            displayName: 'Ansvarig',
            getValue: (booking: BookingViewModel) => booking.ownerUser?.name ?? '-',
            getHeadingValue: (booking: BookingViewModel) => booking.ownerUser?.name ?? '-',
            cellHideSize: 'lg',
            columnWidth: 180,
        },
    ],
};

type Props = {
    bookings: BookingViewModel[];
    tableSettingsOverride?: Partial<TableConfiguration<BookingViewModel>>;
};

const LargeBookingTable: React.FC<Props> = ({ bookings, tableSettingsOverride }: Props) => {
    const [searchText, setSearchText] = useLocalStorageState('large-booking-table-search-text', '');
    const [userIds, setUserIds] = useLocalStorageState<number[]>('large-booking-table-user-ids', []);
    const [statuses, setStatuses] = useLocalStorageState<Status[]>('large-booking-table-statuses', []);
    const [startDate, setStartDate] = useLocalStorageStateForDate('large-booking-table-start-date');
    const [endDate, setEndDate] = useLocalStorageStateForDate('large-booking-table-end-date');

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

    // Check stored values against available values and reset stored values if they do not match available ones
    //
    if (userIds.some((id) => !ownerUserOptions.some((x) => x.value === id))) {
        setUserIds([]);
    }
    if (statuses.some((status) => !statusOptions.some((x) => x.value === status))) {
        setUserIds([]);
    }

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
        .filter(
            (booking: BookingViewModel) =>
                userIds.length === 0 || (booking.ownerUser?.id && userIds.indexOf(booking.ownerUser?.id) >= 0),
        )
        .filter((booking: BookingViewModel) => statuses.length === 0 || statuses.indexOf(booking.status) >= 0)
        .filter(
            (booking: BookingViewModel) =>
                !startDate ||
                !validDate(startDate) ||
                (booking.usageStartDatetime && booking.usageStartDatetime > startDate),
        )
        .filter(
            (booking: BookingViewModel) =>
                !endDate || !validDate(endDate) || (booking.usageEndDatetime && booking.usageEndDatetime < endDate),
        );

    return (
        <>
            <AdvancedFilters
                handleChangeFilterString={handleChangeFilterString}
                searchText={searchText}
                resetAdvancedFilters={() => {
                    setSearchText('');
                    setUserIds([]);
                    setStatuses([]);
                    setStartDate(undefined);
                    setEndDate(undefined);
                }}
                activeFilterCount={countNullorEmpty(searchText, userIds, statuses, startDate, endDate)}
            >
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
                                selected={statuses
                                    .map((id) => statusOptions.find((x) => x.value === id))
                                    .filter(notEmpty)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md="4">
                        <Form.Group>
                            <Form.Label>Ansvarig</Form.Label>
                            <Typeahead<{ label: string; value: number }>
                                id="user-typeahead"
                                multiple
                                labelKey={(x) => x.label}
                                options={ownerUserOptions}
                                onChange={(e) => setUserIds(e.map((o) => o.value))}
                                placeholder="Filtrera på ansvarig"
                                selected={userIds
                                    .map((id) => ownerUserOptions.find((x) => x.value === id))
                                    .filter(notEmpty)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md="2">
                        <Form.Group>
                            <Form.Label>Börjar efter</Form.Label>
                            <Form.Control
                                type="date"
                                onChange={handleChangeStartDate}
                                value={formatDateForForm(startDate)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md="2">
                        <Form.Group>
                            <Form.Label>Slutar före</Form.Label>
                            <Form.Control
                                type="date"
                                onChange={handleChangeEndDate}
                                value={formatDateForForm(endDate)}
                            />
                        </Form.Group>
                    </Col>
                </Form.Row>
            </AdvancedFilters>

            <TableDisplay
                entities={bookingsToShow}
                configuration={{ ...tableSettings, ...tableSettingsOverride }}
                filterString={searchText}
            />
        </>
    );
};

export default LargeBookingTable;
