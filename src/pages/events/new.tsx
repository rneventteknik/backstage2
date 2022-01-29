import React from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { IEventObjectionModel } from '../../models/objection-models';
import { toEvent } from '../../lib/mappers/event';
import EventForm from '../../components/events/EventForm';
import { getResponseContentOrError } from '../../lib/utils';
import { Event } from '../../models/interfaces';
import { Status } from '../../models/enums/Status';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const EventPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny bokning';

    const breadcrumbs = [
        { link: '/events', displayName: 'Bokningar' },
        { link: '/events/new', displayName: pageTitle },
    ];

    const handleSubmit = async (event: Partial<IEventObjectionModel>) => {
        const body = { event: event };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/events', request)
            .then((apiResponse) => getResponseContentOrError<IEventObjectionModel>(apiResponse))
            .then(toEvent)
            .then((data) => {
                router.push('/events/' + data.id);
            });
    };

    const defaultEvent: Partial<Event> = {
        status: Status.DRAFT,
    };

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <div className="float-right">
                <Button variant="primary" form="editEventForm" type="submit">
                    Lägg till bokning
                </Button>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

            <EventForm handleSubmitEvent={handleSubmit} formId="editEventForm" event={defaultEvent} />
        </Layout>
    );
};

export default EventPage;
