import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { getResponseContentOrError } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import { IEventObjectionModel } from '../../../models/objection-models';
import { toEvent } from '../../../lib/mappers/event';
import EventForm from '../../../components/events/EventForm';
import { useNotifications } from '../../../lib/useNotifications';
import { eventFetcher } from '../../../lib/fetchers';
import Header from '../../../components/layout/Header';
import { FormLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { Role } from '../../../models/enums/Role';

export const getServerSideProps = useUserWithDefaultAccessControl(Role.USER);
type Props = { user: CurrentUserInfo };

const EventPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showGeneralDangerMessage } = useNotifications();

    // Edit event
    //
    const router = useRouter();
    const { data: event, error, isValidating, mutate } = useSwr('/api/events/' + router.query.id, eventFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !event) {
        return <FormLoadingPage fixedWidth={true} currentUser={currentUser} />;
    }

    const handleSubmit = async (event: Partial<IEventObjectionModel>) => {
        const body = { event: event };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/events/' + router.query.id, request)
            .then((apiResponse) => getResponseContentOrError<IEventObjectionModel>(apiResponse))
            .then(toEvent)
            .then((event) => {
                mutate(event, false);
                showSaveSuccessNotification('Bokningen');
                router.push('/events/' + event.id);
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Bokningen');
            });
    };

    // Delete event handler
    //
    const deleteEvent = () => {
        setShowDeleteModal(false);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/event/' + event?.id, request)
            .then(getResponseContentOrError)
            .then(() => router.push('/events/'))
            .catch((error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Bokningen kunde inte tas bort');
            });
    };

    // The page itself
    //
    const pageTitle = event?.name;
    const breadcrumbs = [
        { link: '/events', displayName: 'Bokningar' },
        { link: '/events/' + event.id, displayName: pageTitle },
        { link: '/events/' + event.id + '/edit', displayName: 'Redigera' },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editEventForm" type="submit">
                    Spara bokningen
                </Button>
                <DropdownButton
                    id="dropdown-basic-button"
                    className="d-inline-block ml-2"
                    variant="secondary"
                    title="Mer"
                >
                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                        Ta bort bokning
                    </Dropdown.Item>
                </DropdownButton>
            </Header>

            <EventForm event={event} handleSubmitEvent={handleSubmit} formId="editEventForm" />

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bekräfta</Modal.Title>
                </Modal.Header>
                <Modal.Body> Vill du verkligen ta bort bokningen {event.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowDeleteModal(false)}>
                        Avbryt
                    </Button>
                    <Button variant="danger" onClick={() => deleteEvent()}>
                        Ta bort
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
};

export default EventPage;
