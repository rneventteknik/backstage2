import React, { ChangeEvent, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Event } from '../../models/interfaces';
import useSwr from 'swr';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import Link from 'next/link';
import EventTypeTag from '../../components/utils/EventTypeTag';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { validDate, formatDate, getStatusName, notEmpty, onlyUnique, onlyUniqueById } from '../../lib/utils';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Button, Col, Collapse, Form } from 'react-bootstrap';
import { Status } from '../../models/enums/Status';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { eventsFetcher } from '../../lib/fetchers';
import { IfNotReadonly } from '../../components/utils/IfAdmin';

interface EventViewModel extends Event {
    displayDate: string;
}

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Bokningar';
const breadcrumbs = [{ link: 'events', displayName: pageTitle }];

const EventNameDisplayFn = (event: Event) => (
    <>
        <Link href={'events/' + event.id}>{event.name}</Link> <EventTypeTag event={event} />
    </>
);

const EventActionsDisplayFn = (event: Event) => <Link href={'events/' + event.id}>Redigera</Link>;

const tableSettings: TableConfiguration<EventViewModel> = {
    entityTypeDisplayName: 'bokningar',
    defaultSortPropertyName: 'date',
    defaultSortAscending: false,
    hideTableFilter: true,
    columns: [
        {
            key: 'name',
            displayName: 'Bokning',
            getValue: (event: EventViewModel) => event.name + '/' + event.name,
            getContentOverride: EventNameDisplayFn,
        },
        {
            key: 'status',
            displayName: 'Status',
            getValue: (event: EventViewModel) => getStatusName(event.status),
            textAlignment: 'center',
            columnWidth: 180,
        },
        {
            key: 'ownerUser',
            displayName: 'Ansvarig',
            getValue: (event: EventViewModel) => event.ownerUser?.name ?? 'Unknown user',
            textAlignment: 'center',
            columnWidth: 180,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (event: EventViewModel) => event.displayDate,
            columnWidth: 180,
            textAlignment: 'center',
        },
        {
            key: 'actions',
            displayName: '',
            getValue: () => '',
            getContentOverride: EventActionsDisplayFn,
            disableSort: true,
            columnWidth: 100,
            textAlignment: 'center',
        },
    ],
};

const EventListPage: React.FC<Props> = ({ user }: Props) => {
    const { data: events } = useSwr('/api/events', fetcher);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [userIds, setUserIds] = useState<(number | undefined)[]>([]);
    const [statuses, setStatuses] = useState<(Status | undefined)[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    // Handle errors
    //
    if (!events || events.length == 0) {
        return (
            <Layout title={pageTitle} breadcrumbs={breadcrumbs} currentUser={user}>
                <h1>{pageTitle}</h1>
                <hr />
                <p>Det finns inga bokningar att visa</p>
            </Layout>
        );
    }

    // Generate option lists for filters
    //
    const statusOptions = events
        .map((x) => x.status)
        .filter(notEmpty)
        .filter(onlyUnique)
        .map((status) => ({ label: getStatusName(status), value: status }));

    const ownerUserOptions = events
        .map((x) => x.ownerUser)
        .filter(notEmpty)
        .filter(onlyUniqueById)
        .map((user) => ({ label: user.name, value: user.id }));

    // Handlers for changed events
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
    const eventsToShow = events
        .filter((event: Event) => userIds.length === 0 || userIds.indexOf(event.ownerUser?.id) >= 0)
        .filter((event: Event) => statuses.length === 0 || statuses.indexOf(event.status) >= 0)
        .filter((event: Event) => !startDate || !validDate(startDate) || (event.created && event.created > startDate))
        .filter((event: Event) => !endDate || !validDate(endDate) || (event.created && event.created < endDate));

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} currentUser={user}>
            <IfNotReadonly currentUser={user}>
                <div className="float-right">
                    <Link href="/events/new">
                        <Button variant="primary" as="span">
                            Lägg till bokning
                        </Button>
                    </Link>
                </div>
            </IfNotReadonly>
            <h1>{pageTitle}</h1>
            <hr />

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

            <TableDisplay entities={eventsToShow} configuration={tableSettings} filterString={searchText} />
        </Layout>
    );
};

// Calculating date formats are expensive, so precalculate the date string to increase performace.
const fetcher = (url: string) =>
    eventsFetcher(url).then((events) =>
        events.map((event) => ({
            ...event,
            displayDate: event.created ? formatDate(new Date(event.created)) : '-',
        })),
    );

export default EventListPage;
