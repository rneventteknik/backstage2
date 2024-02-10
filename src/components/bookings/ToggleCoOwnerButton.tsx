import React from 'react';
import useSwr from 'swr';
import { Button } from 'react-bootstrap';
import { bookingFetcher } from '../../lib/fetchers';
import { useNotifications } from '../../lib/useNotifications';
import { getResponseContentOrError } from '../../lib/utils';
import { Booking } from '../../models/interfaces';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { IBookingObjectionModel } from '../../models/objection-models';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    booking: Booking;
    disabled?: boolean;
    currentUser: CurrentUserInfo;
};

const ToggleCoOwnerButton: React.FC<Props & React.ComponentProps<typeof Button>> = ({
    booking: parentBooking,
    currentUser,
    ...rest
}: Props & React.ComponentProps<typeof Button>) => {
    const { showGeneralSuccessMessage, showErrorMessage } = useNotifications();
    const { data: booking, mutate } = useSwr('/api/bookings/' + parentBooking.id, bookingFetcher);

    const isCoOwner = parentBooking?.coOwnerUsers?.some((x) => x.id === currentUser.userId) ?? false;

    const toggleCoOwnerUser = async () => {
        if (!currentUser.userId) {
            throw new Error('Invalid user');
        }

        if (!booking?.id) {
            throw new Error('Invalid booking');
        }

        const request = {
            method: isCoOwner ? 'DELETE' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/users/' + currentUser.userId + '/coOwnerBookings/' + booking.id, request)
            .then((apiResponse) => getResponseContentOrError<IBookingObjectionModel>(apiResponse))
            .then(() => {
                showGeneralSuccessMessage('Favoritstatus uppdaterad');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Favoritstatus kunde inte uppdateras');
            });
    };

    return (
        <Button onClick={toggleCoOwnerUser} {...rest}>
            <FontAwesomeIcon icon={isCoOwner ? faStarSolid : faStarOutline} className="mr-1" />
            {isCoOwner ? 'Ta bort favorit' : 'Favoritmarkera'}
        </Button>
    );
};

export default ToggleCoOwnerButton;
