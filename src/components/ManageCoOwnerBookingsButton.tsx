import { faCogs } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';
import { getResponseContentOrError } from '../lib/utils';
import { CalendarResult } from '../models/misc/CalendarResult';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { IBookingObjectionModel } from '../models/objection-models';
import { useNotifications } from '../lib/useNotifications';
import { Booking } from '../models/interfaces';

type Props = {
    className?: string;
    currentUser: CurrentUserInfo;
    currentCoOwnerBookings: Booking[];
    mutate: () => void;
};

const ManageCoOwnerBookingsButton: React.FC<Props> = ({
    className,
    currentUser,
    currentCoOwnerBookings,
    mutate,
}: Props) => {
    const { showGeneralSuccessMessage, showErrorMessage } = useNotifications();

    const fetchCalenderEvents = async () => {
        return fetch('api/calendar').then((response) => getResponseContentOrError<CalendarResult[]>(response));
    };

    const addUserAsCoOwnerToBooking = async (userId: number, bookingId: number) => {
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/users/' + userId + '/coOwnerBookings/' + bookingId, request)
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

    const addUserAsCoOwnerToAllFutureBookingsForUser = async () => {
        const calendarEvents = await fetchCalenderEvents();

        const calenderEventForThisUser = calendarEvents.filter(
            (event) => currentUser.userId && event.workingUsersIds.includes(currentUser.userId),
        );

        const existingBookingIds = calenderEventForThisUser.map((event) => event.existingBookingId);

        const coOwnerBookingsToAdd = existingBookingIds.filter(
            (bookingId) => !currentCoOwnerBookings.some((booking) => booking.id === bookingId),
        );

        coOwnerBookingsToAdd.forEach((bookingId) => {
            currentUser.userId && bookingId ? addUserAsCoOwnerToBooking(currentUser.userId, bookingId) : null;
        });

        if (coOwnerBookingsToAdd.length === 0) {
            showGeneralSuccessMessage('Inga nya bokningar att lägga till');
        }
    };

    return (
        <>
            <Button
                variant="secondary"
                className={className}
                onClick={() => addUserAsCoOwnerToAllFutureBookingsForUser()}
            >
                <FontAwesomeIcon icon={faCogs} className="mr-1" /> Lägg till alla framtida bokningar jag arbetar på som
                favoriter
            </Button>
        </>
    );
};

export default ManageCoOwnerBookingsButton;
