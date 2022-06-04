import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { getResponseContentOrError } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import { IBookingObjectionModel } from '../../../models/objection-models';
import { toBooking } from '../../../lib/mappers/booking';
import BookingForm from '../../../components/bookings/BookingForm';
import { useNotifications } from '../../../lib/useNotifications';
import { bookingFetcher } from '../../../lib/fetchers';
import Header from '../../../components/layout/Header';
import { FormLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { Role } from '../../../models/enums/Role';
import { faSave, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl(Role.USER);
type Props = { user: CurrentUserInfo };

const BookingPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showGeneralDangerMessage } = useNotifications();

    // Edit booking
    //
    const router = useRouter();
    const { data: booking, error, isValidating, mutate } = useSwr('/api/bookings/' + router.query.id, bookingFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !booking) {
        return <FormLoadingPage fixedWidth={true} currentUser={currentUser} />;
    }

    const handleSubmit = async (booking: Partial<IBookingObjectionModel>) => {
        const body = { booking: booking };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + router.query.id, request)
            .then((apiResponse) => getResponseContentOrError<IBookingObjectionModel>(apiResponse))
            .then(toBooking)
            .then((booking) => {
                mutate(booking, false);
                showSaveSuccessNotification('Bokningen');
                router.push('/bookings/' + booking.id);
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Bokningen');
            });
    };

    // Delete booking handler
    //
    const deleteBooking = () => {
        setShowDeleteModal(false);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/booking/' + booking?.id, request)
            .then(getResponseContentOrError)
            .then(() => router.push('/bookings/'))
            .catch((error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Bokningen kunde inte tas bort');
            });
    };

    // The page itself
    //
    const pageTitle = booking?.name;
    const breadcrumbs = [
        { link: '/bookings', displayName: 'Bokningar' },
        { link: '/bookings/' + booking.id, displayName: pageTitle },
        { link: '/bookings/' + booking.id + '/edit', displayName: 'Redigera' },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editBookingForm" type="submit">
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Spara bokning
                </Button>
                <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                        <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort bokning
                    </Dropdown.Item>
                </DropdownButton>
            </Header>

            <BookingForm booking={booking} handleSubmitBooking={handleSubmit} formId="editBookingForm" />

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bekräfta</Modal.Title>
                </Modal.Header>
                <Modal.Body> Vill du verkligen ta bort bokningen {booking.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowDeleteModal(false)}>
                        Avbryt
                    </Button>
                    <Button variant="danger" onClick={() => deleteBooking()}>
                        Ta bort
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
};

export default BookingPage;
