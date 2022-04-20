import React from 'react';
import { Button, Card, Dropdown, DropdownButton } from 'react-bootstrap';
import useSwr from 'swr';
import { faExclamationCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton from 'react-loading-skeleton';
import { formatDate, getResponseContentOrError } from '../../lib/utils';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import { CalendarResult } from '../../models/misc/CalendarResult';
import Link from 'next/link';

type Props = {
    onSelect: (x: CalendarResult) => void;
};

interface CalendarResultViewModel extends CalendarResult {
    displayStartDate: string;
    displayEndDate: string;
}

const dateWithoutTimeRegEx = /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/;

const CalendarEventsList: React.FC<Props> = ({ onSelect: onSelect }: Props) => {
    const { data: list, error } = useSwr('/api/calendar/', (url) =>
        fetch(url)
            .then((response) => getResponseContentOrError<CalendarResult[]>(response))
            .then((calenderResults) =>
                calenderResults.map((calenderResult) => ({
                    ...calenderResult,
                    displayStartDate: calenderResult.start
                        ? calenderResult.start.match(dateWithoutTimeRegEx)
                            ? calenderResult.start
                            : formatDate(new Date(calenderResult.start))
                        : '-',
                    displayEndDate: calenderResult.end
                        ? calenderResult.end.match(dateWithoutTimeRegEx)
                            ? calenderResult.end
                            : formatDate(new Date(calenderResult.end))
                        : '-',
                })),
            ),
    );

    // Error handling
    //
    if (error) {
        return (
            <Card className="mb-3">
                <Card.Body>
                    <p className="text-danger">
                        <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda kalenderlistan.
                    </p>
                    <p className="text-monospace text-muted mb-0">{error.message}</p>
                </Card.Body>
            </Card>
        );
    }

    // Loading skeleton
    //
    if (!list) {
        return <Skeleton height={200} className="mb-3" />;
    }

    // Table display functions
    //
    const CalendarResultNameDisplayFn = (calendarResult: CalendarResultViewModel) => (
        <>
            <span>{calendarResult.name}</span>
            <div className="text-muted mb-0">{calendarResult.creator ?? 'N/A'}</div>
            <div className="text-muted mb-0 d-lg-none">
                {calendarResult?.displayStartDate + ' till ' + calendarResult?.displayEndDate}
            </div>
            <div className="text-muted mb-0">{calendarResult.description}</div>
        </>
    );

    const CalendarResultActionsDisplayFn = (calendarResult: CalendarResultViewModel) => {
        return (
            <>
                <Button
                    variant={calendarResult.existingEventId ? 'secondary' : 'primary'}
                    title="Mer"
                    size="sm"
                    className="d-inline mr-2"
                    onClick={() => onSelect(calendarResult)}
                    disabled={!!calendarResult.existingEventId}
                >
                    Skapa Bokning
                </Button>

                <DropdownButton
                    id="dropdown-basic-button"
                    variant="secondary"
                    title="Mer"
                    size="sm"
                    className="d-inline"
                >
                    <Dropdown.Item href={calendarResult.link} target="_blank">
                        Visa i Google Calender <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </Dropdown.Item>
                    {calendarResult.existingEventId ? (
                        <Link href={'/events/' + calendarResult.existingEventId} passHref>
                            <Dropdown.Item href={'/events/' + calendarResult.existingEventId}>
                                Öppna Event
                            </Dropdown.Item>
                        </Link>
                    ) : null}
                </DropdownButton>
            </>
        );
    };

    // Table settings
    //
    const tableSettings: TableConfiguration<CalendarResultViewModel> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'start',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: false,
        noResultsLabel: 'Listan är tom',
        columns: [
            {
                key: 'name',
                displayName: 'Namn',
                getValue: (entry: CalendarResultViewModel) => entry.name ?? 'N/A',
                getContentOverride: CalendarResultNameDisplayFn,
            },
            {
                key: 'start',
                displayName: 'Start',
                getValue: (entry: CalendarResultViewModel) => entry.start ?? '',
                getContentOverride: (entry: CalendarResultViewModel) => entry.displayStartDate,
                textAlignment: 'center',
                cellHideSize: 'lg',
                columnWidth: 160,
            },
            {
                key: 'end',
                displayName: 'Slut',
                getValue: (entry: CalendarResultViewModel) => entry.end ?? '',
                getContentOverride: (entry: CalendarResultViewModel) => entry.displayEndDate,
                textAlignment: 'center',
                cellHideSize: 'lg',
                columnWidth: 160,
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                getContentOverride: CalendarResultActionsDisplayFn,
                disableSort: true,
                columnWidth: 175,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <Card className="mb-3">
            <TableDisplay entities={list} configuration={tableSettings} />
        </Card>
    );
};

export default CalendarEventsList;
