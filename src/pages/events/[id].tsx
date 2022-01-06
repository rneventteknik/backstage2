import React from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Event } from '../../models/interfaces';
import EventTypeTag from '../../components/utils/EventTypeTag';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const EventPage: React.FC<Props> = ({ user }: Props) => {
    const router = useRouter();
    const { data } = useSwr('/api/events/' + router.query.id, fetcher);
    const event: Event = data as Event;
    const breadcrumbs = [
        { link: '/events', displayName: 'Bokningar' },
        { link: '/events/' + router.query.id, displayName: event?.name },
    ];

    return (
        <Layout title={event?.name ?? 'Event'} breadcrumbs={breadcrumbs} currentUser={user} fixedWidth={true}>
            <h1>
                {event?.name}{' '}
                <small>
                    <EventTypeTag event={event} />
                </small>
            </h1>

            <dl>
                <dt>Owneruser</dt>
                <dd>{event?.ownerUser?.name}</dd>

                <dt>Coownerusers</dt>
                <dd>{JSON.stringify(event?.coOwnerUsers)}</dd>

                <dt>Equipmenttlists</dt>
                <dd>{JSON.stringify(event?.equipmenttLists)}</dd>

                <dt>Timeestimates</dt>
                <dd>{JSON.stringify(event?.timeEstimates)}</dd>

                <dt>Timereports</dt>
                <dd>{JSON.stringify(event?.timeReports)}</dd>

                <dt>Changelog</dt>
                <dd>{JSON.stringify(event?.changelog)}</dd>

                <dt>Eventtype</dt>
                <dd>{event?.eventType}</dd>

                <dt>Status</dt>
                <dd>{event?.status}</dd>

                <dt>Invoicehogiaid</dt>
                <dd>{event?.invoiceHogiaId}</dd>

                <dt>Invoiceaddress</dt>
                <dd>{event?.invoiceAddress}</dd>

                <dt>Invoicetag</dt>
                <dd>{event?.invoiceTag}</dd>

                <dt>Priceplan</dt>
                <dd>{event?.pricePlan}</dd>

                <dt>Accountkind</dt>
                <dd>{event?.accountKind}</dd>

                <dt>Note</dt>
                <dd>{event?.note}</dd>

                <dt>Returnalnote</dt>
                <dd>{event?.returnalNote}</dd>

                <dt>Location</dt>
                <dd>{event?.location}</dd>

                <dt>Contactpersonname</dt>
                <dd>{event?.contactPersonName}</dd>

                <dt>Contactpersonphone</dt>
                <dd>{event?.contactPersonPhone}</dd>

                <dt>Contactpersonemail</dt>
                <dd>{event?.contactPersonEmail}</dd>
            </dl>
        </Layout>
    );
};

export default EventPage;

const fetcher = (url: string) => fetch(url).then((res) => res.json());
