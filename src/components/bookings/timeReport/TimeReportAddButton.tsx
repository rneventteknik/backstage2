import React from 'react';
import { Button } from 'react-bootstrap';
import { ITimeReportObjectionModel } from '../../../models/objection-models';
import { toTimeReport } from '../../../lib/mappers/timeReport';
import { TimeReport } from '../../../models/interfaces/TimeReport';
import { useNotifications } from '../../../lib/useNotifications';
import { Booking } from '../../../models/interfaces';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { formatDatetime } from '../../../lib/datetimeUtils';
import { getPricePerHour, getResponseContentOrError } from '../../../lib/utils';

type Props = {
    booking: Booking;
    disabled: boolean;
    sortIndex: number;
    onAdd: (data: TimeReport) => void;
    currentUser: CurrentUserInfo;
};

const TimeReportAddButton: React.FC<Props & React.ComponentProps<typeof Button>> = ({
    booking,
    onAdd,
    sortIndex,
    currentUser,
    children,
    ...rest
}: Props & React.ComponentProps<typeof Button>) => {
    const { showCreateFailedNotification } = useNotifications();

    const addEmptyTimeReport = async () => {
        if (!currentUser.userId) {
            showCreateFailedNotification('Tidrapporten');
            return;
        }

        const pricePerHour = getPricePerHour(booking.pricePlan);

        const timeReport: ITimeReportObjectionModel = {
            bookingId: booking.id,
            billableWorkingHours: 0,
            actualWorkingHours: 0,
            userId: currentUser.userId,
            startDatetime: formatDatetime(new Date()),
            endDatetime: formatDatetime(new Date()),
            pricePerHour: pricePerHour ?? 0,
            name: '',
            accountKind: booking.accountKind,
            sortIndex: sortIndex,
        };

        const body = { timeReport: timeReport };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + booking.id + '/timeReport', request)
            .then((apiResponse) => getResponseContentOrError<ITimeReportObjectionModel>(apiResponse))
            .then(toTimeReport)
            .then((data) => {
                onAdd(data);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Tidrapporten');
            });
    };

    return (
        <Button onClick={addEmptyTimeReport} {...rest}>
            {children}
        </Button>
    );
};

export default TimeReportAddButton;
