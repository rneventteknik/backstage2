import React from 'react';
import Layout from '../../components/Layout';
import { Event } from '../../interfaces';
import useSwr from 'swr';
import Link from 'next/link';
import EventTypeTag from '../../components/utils/EventTypeTag';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { formatDate, getStatusName } from '../../lib/utils';

const EventNameDisplayFn = (event: Event) => (
    <>
        <Link href={'events/' + event.id}>{event.name}</Link> <EventTypeTag event={event} />
    </>
);

const EventActionsDisplayFn = (event: Event) => <Link href={'events/' + event.id}>Redigera</Link>;

const tableSettings: TableConfiguration<Event> = {
    defaultSortPropertyName: 'date',
    defaultSortAscending: false,
    columns: [
        {
            key: 'name',
            displayName: 'Bokning',
            getValue: (event: Event) => event.name + '/' + event.name,
            getContentOverride: EventNameDisplayFn,
        },
        {
            key: 'status',
            displayName: 'Status',
            getValue: (event: Event) => getStatusName(event.status),
            textAlignment: 'center',
            columnWidth: 180,
        },
        {
            key: 'ownerUser',
            displayName: 'Ansvarig',
            getValue: (event: Event) => event.ownerUser?.name ?? 'Unknown user',
            textAlignment: 'center',
            columnWidth: 180,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (event: Event) => formatDate(new Date(event.created)),
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

const pageTitle = 'Bokningar';
const breadcrumbs = [{ link: 'events', displayName: pageTitle }];

const EventListPage: React.FC = () => {
    const { data } = useSwr('/api/events', fetcher);

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs}>
            <h1>{pageTitle}</h1>

            {data && data.length > 0 ? (
                <TableDisplay entities={data} configuration={tableSettings} />
            ) : (
                <span>Inga bokningar</span>
            )}
        </Layout>
    );
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default EventListPage;
