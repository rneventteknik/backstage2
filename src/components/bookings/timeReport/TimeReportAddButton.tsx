import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { ITimeReportObjectionModel } from '../../../models/objection-models';
import { TimeReport } from '../../../models/interfaces/TimeReport';
import { useNotifications } from '../../../lib/useNotifications';
import { BookingViewModel } from '../../../models/interfaces';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import TimeReportModal from './TimeReportModal';
import currency from 'currency.js';
import { addTimeReportApiCall } from '../../../lib/equipmentListUtils';

type Props = {
    booking: BookingViewModel;
    disabled: boolean;
    onAdd: (timeReport: TimeReport) => void;
    currentUser: CurrentUserInfo;
    defaultLaborHourlyRate: number;
};

const TimeReportAddButton: React.FC<Props & React.ComponentProps<typeof Button>> = ({
    booking,
    onAdd,
    currentUser,
    children,
    defaultLaborHourlyRate,
    ...rest
}: Props & React.ComponentProps<typeof Button>) => {
    const [timeReport, setTimeReport] = useState<Partial<TimeReport> | undefined>(undefined);
    const { showCreateSuccessNotification, showCreateFailedNotification } =
        useNotifications();

    const addTimeReport = (timeReport: ITimeReportObjectionModel) => {
        addTimeReportApiCall(timeReport, booking.id)
            .then((data) => {
                showCreateSuccessNotification("Tidrapporten");
                onAdd(data);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Tidrapporten');
            });
    };

    return (
        <>
            <Button
                onClick={() => {
                    const currentDateRounded = new Date();
                    currentDateRounded.setMinutes(0, 0, 0);
                    setTimeReport({
                        startDatetime: booking.usageStartDatetime ?? currentDateRounded,
                        endDatetime: booking.usageEndDatetime ?? currentDateRounded,
                        userId: currentUser.userId,
                        pricePerHour: currency(defaultLaborHourlyRate),
                    });
                }}
                {...rest}
            >
                {children}
            </Button>
            <TimeReportModal
                formId="form-add-timeReport-modal"
                booking={booking}
                defaultLaborHourlyRate={defaultLaborHourlyRate}
                timeReport={timeReport}
                setTimeReport={setTimeReport}
                onHide={() => {
                    setTimeReport(undefined);
                }}
                onSubmit={(timeReport) => {
                    addTimeReport(timeReport);
                }}
            ></TimeReportModal>
        </>
    );
};

export default TimeReportAddButton;
