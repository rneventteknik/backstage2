import React, { ChangeEvent, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Event } from '../../models/interfaces';
import useSwr from 'swr';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import EventTypeTag from '../../components/utils/EventTypeTag';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { validDate, formatDate, getStatusName, notEmpty, onlyUnique, onlyUniqueById } from '../../lib/utils';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Button, Col, Collapse, Form } from 'react-bootstrap';
import { Status } from '../../models/enums/Status';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/layout/Header';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { eventsFetcher } from '../../lib/fetchers';
import TableStyleLink from '../../components/utils/TableStyleLink';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { IfNotReadonly } from '../../components/utils/IfAdmin';
import Link from 'next/link';

interface EventViewModel extends Event {
    displayDate: string;
}

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Bokningar';
const breadcrumbs = [{ link: 'events', displayName: pageTitle }];

const EventNameDisplayFn = (event: EventViewModel) => (
    <>
        <TableStyleLink href={'events/' + event.id}>{event.name}</TableStyleLink>

        <EventTypeTag event={event} className="ml-1" />
        <p className="text-muted mb-0">{getStatusName(event.status)}</p>
        <p className="text-muted mb-0 d-lg-none">{event.ownerUser?.name ?? '-'}</p>
        <p className="text-muted mb-0 d-sm-none">{event.displayDate}</p>
    </>
);

const tableSettings: TableConfiguration<EventViewModel> = {
    entityTypeDisplayName: 'bokningar',
    defaultSortPropertyName: 'date',
    defaultSortAscending: false,
    hideTableFilter: true,
    columns: [
        {
            key: 'name',
            displayName: 'Bokning',
            getValue: (event: EventViewModel) => event.name,
            textTruncation: true,
            getContentOverride: EventNameDisplayFn,
        },
        {
            key: 'customerName',
            displayName: 'Beställare',
            getValue: (event: EventViewModel) => event.customerName ?? '-',
            textTruncation: true,
        },
        {
            key: 'location',
            displayName: 'Plats',
            getValue: (event: EventViewModel) => event.location ?? '-',
            textAlignment: 'center',
            cellHideSize: 'xl',
            columnWidth: 180,
        },
        {
            key: 'ownerUser',
            displayName: 'Ansvarig',
            getValue: (event: EventViewModel) => event.ownerUser?.name ?? '-',
            textAlignment: 'center',
            cellHideSize: 'lg',
            columnWidth: 180,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (event: EventViewModel) => event.displayDate,
            columnWidth: 180,
            textAlignment: 'center',
            cellHideSize: 'sm',
        },
    ],
};

const EventListPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: events, error, isValidating } = useSwr('/api/events', fetcher);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [userIds, setUserIds] = useState<(number | undefined)[]>([]);
    const [statuses, setStatuses] = useState<(Status | undefined)[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !events) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} />;
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
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href="/events/new" passHref>
                        <Button variant="primary" as="span">
                            Lägg till bokning
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
