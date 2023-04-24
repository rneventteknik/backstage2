import React, { ReactNode, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ITimeEstimateObjectionModel } from '../../../models/objection-models';
import { getResponseContentOrError } from '../../../lib/utils';
import { toTimeEstimate } from '../../../lib/mappers/timeEstimate';
import { TimeEstimate } from '../../../models/interfaces/TimeEstimate';
import { useNotifications } from '../../../lib/useNotifications';
import { Booking } from '../../../models/interfaces';
import TimeEstimateModal from './TimeEstimateModal';
import { getNextSortIndex } from '../../../lib/sortIndexUtils';

type Props = {
    booking: Booking;
    onAdd: (data: TimeEstimate) => void;
    children?: ReactNode;
    defaultLaborHourlyRate: number;
};

const TimeEstimateAddButton: React.FC<Props & React.ComponentProps<typeof Button>> = ({
    booking,
    onAdd,
    children,
    defaultLaborHourlyRate,
    ...rest
}: Props & React.ComponentProps<typeof Button>) => {
    const { showCreateFailedNotification } = useNotifications();
    const [timeEstimateViewModel, setTimeEstimateViewModel] = useState<Partial<TimeEstimate> | undefined>(undefined);

    const addTimeEstimate = async (timeEstimate: ITimeEstimateObjectionModel) => {
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

    return (
        <>
            <Button
                {...rest}
                onClick={() => {
                    setTimeEstimateViewModel({
                        pricePerHour: defaultLaborHourlyRate,
                    });
                }}
            >
                {children}
            </Button>
            <TimeEstimateModal
                formId="form-add-time-estimate-modal"
                booking={booking}
                defaultLaborHourlyRate={defaultLaborHourlyRate}
                timeEstimate={timeEstimateViewModel}
                setTimeEstimate={setTimeEstimateViewModel}
                onHide={() => {
                    setTimeEstimateViewModel(undefined);
                }}
                onSubmit={() => {
                    const timeEstimateToSend: ITimeEstimateObjectionModel = {
                        id: timeEstimateViewModel?.id,
                        bookingId: booking.id,
                        numberOfHours: timeEstimateViewModel?.numberOfHours ?? 0,
                        pricePerHour: timeEstimateViewModel?.pricePerHour ?? 0,
                        name: timeEstimateViewModel?.name ?? '',
                        sortIndex: getNextSortIndex(booking.timeEstimates ?? []),
                    };
                    addTimeEstimate(timeEstimateToSend);
                }}
            ></TimeEstimateModal>
        </>
    );
};

export default TimeEstimateAddButton;
