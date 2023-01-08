import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { getResponseContentOrError } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
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
import ConfirmModal from '../../../components/utils/ConfirmModal';
import { KeyValue } from '../../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.USER);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const BookingPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showGeneralDangerMessage } = useNotifications();

    // Edit booking
    //
    const router = useRouter();
    const {
        data: booking,
        error,
        isValidating,
        mutate,
    } = useSwr('/api/bookings/' + router.query.id, bookingFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    if (error) {
        return (
            <ErrorPage
                errorMessage={error.message}
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            />
        );
    }

    if (isValidating || !booking) {
        return <FormLoadingPage fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings} />;
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

        fetch('/api/bookings/' + booking?.id, request)
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
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
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

            <ConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Bekräfta"
                confirmLabel="Ta bort"
                onConfirm={deleteBooking}
            >
                Vill du verkligen ta bort bokningen {booking.name}?
            </ConfirmModal>
        </Layout>
    );
};

export default BookingPage;
