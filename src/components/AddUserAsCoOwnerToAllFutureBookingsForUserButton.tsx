import { faCircleNotch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';
import { getResponseContentOrError, notEmpty } from '../lib/utils';
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

const AddUserAsCoOwnerToAllFutureBookingsForUserButton: React.FC<Props> = ({
    className,
    currentUser,
    currentCoOwnerBookings,
    mutate,
}: Props) => {
    const { showGeneralInfoMessage, showGeneralSuccessMessage, showErrorMessage } = useNotifications();
    const [isLoading, setIsLoading] = React.useState(false);

    const fetchCalenderEvents = async () => {
        return fetch('api/calendar').then((response) => getResponseContentOrError<CalendarResult[]>(response));
    };

    const addUserAsCoOwner = async (userId: number, bookingId: number) => {
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        };

        return fetch('/api/users/' + userId + '/coOwnerBookings/' + bookingId, request)
            .then((apiResponse) => getResponseContentOrError<IBookingObjectionModel>(apiResponse))
            .then(() => {
                showGeneralSuccessMessage('Favorit tillagd');
            })
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Favoritstatus kunde inte uppdateras');
            });
    };

    const addUserAsCoOwnerToAllFutureBookingsForUser = async () => {
        setIsLoading(true);
        showGeneralInfoMessage('Söker i kalendern efter bokningar...');

        const userId = currentUser.userId!;

        const calendarEvents = await fetchCalenderEvents();
        const calenderEventForThisUser = calendarEvents.filter((event) =>
            event.workingUsers.map((x) => x.id).includes(userId),
        );
        const bookingIds = calenderEventForThisUser.map((event) => event.existingBookingId).filter(notEmpty);

        const bookingsToAdd = bookingIds.filter(
            (bookingId) => !currentCoOwnerBookings.some((booking) => booking.id === bookingId),
        );

        if (bookingsToAdd.length > 0) {
            await Promise.all(bookingsToAdd.map((bookingId) => addUserAsCoOwner(userId, bookingId)));
            mutate();
        } else {
            showGeneralSuccessMessage('Inga nya bokningar att lägga till');
        }

        setIsLoading(false);
    };

    return (
        <>
            <Button
                variant="secondary"
                size="sm"
                disabled={isLoading}
                className={className}
                onClick={() => addUserAsCoOwnerToAllFutureBookingsForUser()}
            >
                {isLoading ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="mr-1" spin />
                ) : (
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                )}
                Favoritmarkera bokningar jag arbetar på
            </Button>
        </>
    );
};

export default AddUserAsCoOwnerToAllFutureBookingsForUserButton;
