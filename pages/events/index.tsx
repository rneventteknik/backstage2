import React from 'react';
import Layout from '../../components/Layout';
import { Event } from '../../interfaces';
import useSwr from 'swr';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { CurrentUserInfo } from '../../interfaces/auth/CurrentUserInfo';
import Link from 'next/link';
import EventTypeTag from '../../components/utils/EventTypeTag';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { formatDate, getStatusName } from '../../lib/utils';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Bokningar';
const breadcrumbs = [{ link: 'events', displayName: pageTitle }];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
            getValue: (event: Event) => (event.created ? formatDate(new Date(event.created)) : '-'),
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
    const { data } = useSwr('/api/events', fetcher);

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} currentUser={user}>
            <h1>{pageTitle}</h1>
            {data && data.length > 0 ? (
                <TableDisplay entities={data} configuration={tableSettings} />
            ) : (
                <span>Inga bokningar</span>
            )}
        </Layout>
    );
};

export default EventListPage;
