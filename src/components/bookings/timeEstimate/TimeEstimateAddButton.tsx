import React, { ReactNode, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ITimeEstimateObjectionModel } from '../../../models/objection-models';
import { TimeEstimate } from '../../../models/interfaces/TimeEstimate';
import { useNotifications } from '../../../lib/useNotifications';
import { Booking } from '../../../models/interfaces';
import TimeEstimateModal from './TimeEstimateModal';
import { getNextSortIndex } from '../../../lib/sortIndexUtils';
import { addTimeEstimateApiCall } from '../../../lib/equipmentListUtils';
import currency from 'currency.js';

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
        addTimeEstimateApiCall(timeEstimate, booking.id)
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
                        pricePerHour: currency(defaultLaborHourlyRate),
                    });
                }}
            >
                {children}
            </Button>
            <TimeEstimateModal
                formId="form-add-time-estimate-modal"
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
                        pricePerHour: timeEstimateViewModel?.pricePerHour?.value ?? 0,
                        name: timeEstimateViewModel?.name ?? '',
                        sortIndex: getNextSortIndex(booking.timeEstimates ?? []),
                    };
                    addTimeEstimate(timeEstimateToSend);
                }}
                wizardLanguage={booking.language}
            ></TimeEstimateModal>
        </>
    );
};

export default TimeEstimateAddButton;
