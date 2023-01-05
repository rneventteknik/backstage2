import React, { ReactNode } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { ITimeEstimateObjectionModel } from '../../../models/objection-models';
import { getResponseContentOrError } from '../../../lib/utils';
import { toTimeEstimate } from '../../../lib/mappers/timeEstimate';
import { TimeEstimate } from '../../../models/interfaces/TimeEstimate';
import { useNotifications } from '../../../lib/useNotifications';
import { Booking } from '../../../models/interfaces';

type Props = {
    booking: Booking;
    sortIndex: number;
    onAdd: (data: TimeEstimate) => void;
    buttonType: 'dropdown' | 'button';
    children?: ReactNode;
    defaultSalary: number;
};

const TimeEstimateAddButton: React.FC<Props & React.ComponentProps<typeof Button>> = ({
    booking,
    onAdd,
    sortIndex,
    buttonType,
    children,
    defaultSalary,
    ...rest
}: Props & React.ComponentProps<typeof Button>) => {
    const { showCreateFailedNotification } = useNotifications();

    const addEmptyTimeEstimate = async () => {
        const timeEstimate: ITimeEstimateObjectionModel = {
            bookingId: booking.id,
            numberOfHours: 0,
            pricePerHour: defaultSalary,
            name: '',
            sortIndex: sortIndex,
        };

        const body = { timeEstimate: timeEstimate };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + booking.id + '/timeEstimate', request)
            .then((apiResponse) => getResponseContentOrError<ITimeEstimateObjectionModel>(apiResponse))
            .then(toTimeEstimate)
            .then((data) => {
                onAdd(data);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Tidsestimatet');
            });
    };

    return buttonType === 'dropdown' ? (
        <Dropdown.Item onClick={addEmptyTimeEstimate}>{children}</Dropdown.Item>
    ) : (
        <Button {...rest} onClick={addEmptyTimeEstimate}>
            {children}
        </Button>
    );
};

export default TimeEstimateAddButton;
