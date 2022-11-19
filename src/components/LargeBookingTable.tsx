import React, { ChangeEvent, useState } from 'react';
import { BookingViewModel } from '../models/interfaces';
import BookingTypeTag from '../components/utils/BookingTypeTag';
import { TableDisplay, TableConfiguration } from '../components/TableDisplay';
import { getStatusName, notEmpty, onlyUnique, onlyUniqueById } from '../lib/utils';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Button, Col, Collapse, Form } from 'react-bootstrap';
import { Status } from '../models/enums/Status';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import TableStyleLink from '../components/utils/TableStyleLink';
import RentalStatusTag from './utils/RentalStatusTag';
import { validDate } from '../lib/datetimeUtils';

const BookingNameDisplayFn = (booking: BookingViewModel) => (
    <>
        <TableStyleLink href={'/bookings/' + booking.id}>{booking.name}</TableStyleLink>

        <BookingTypeTag booking={booking} className="ml-1" />
        <RentalStatusTag booking={booking} className="ml-1" />
        <p className="text-muted mb-0">{getStatusName(booking.status)}</p>
        <p className="text-muted mb-0 d-lg-none">{booking.customerName ?? '-'}</p>
        <p className="text-muted mb-0 d-lg-none">{booking.ownerUser?.name ?? '-'}</p>
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
            displayName: 'Kund',
            getValue: (booking: BookingViewModel) => booking.customerName ?? '-',
            textTruncation: true,
            cellHideSize: 'lg',
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
            cellHideSize: 'lg',
            columnWidth: 180,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (booking: BookingViewModel) => booking.isoFormattedUsageStartString,
            getContentOverride: BookingUsageIntervalDisplayFn,
            columnWidth: 200,
        },
    ],
};

type Props = {
    bookings: BookingViewModel[];
    tableSettingsOverride?: Partial<TableConfiguration<BookingViewModel>>;
};

const LargeBookingTable: React.FC<Props> = ({ bookings, tableSettingsOverride }: Props) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [userIds, setUserIds] = useState<(number | undefined)[]>([]);
    const [statuses, setStatuses] = useState<(Status | undefined)[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

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
        .filter((booking: BookingViewModel) => userIds.length === 0 || userIds.indexOf(booking.ownerUser?.id) >= 0)
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
                            <Form.Label>Börjar efter</Form.Label>
                            <Form.Control type="date" onChange={handleChangeStartDate} />
                        </Form.Group>
                    </Col>
                    <Col md="2">
                        <Form.Group>
                            <Form.Label>Slutar före</Form.Label>
                            <Form.Control type="date" onChange={handleChangeEndDate} />
                        </Form.Group>
                    </Col>
                </Form.Row>
            </Collapse>

            <TableDisplay
                entities={bookingsToShow}
                configuration={{ ...tableSettings, ...tableSettingsOverride }}
                filterString={searchText}
            />
        </>
    );
};

export default LargeBookingTable;
