import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { ITimeReportObjectionModel } from '../../../models/objection-models';
import { toTimeReport } from '../../../lib/mappers/timeReport';
import { TimeReport } from '../../../models/interfaces/TimeReport';
import { useNotifications } from '../../../lib/useNotifications';
import { BookingViewModel } from '../../../models/interfaces';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { getResponseContentOrError } from '../../../lib/utils';
import TimeReportModal from './TimeReportModal';
import currency from 'currency.js';

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
    const { showCreateFailedNotification } = useNotifications();
    const [timeReport, setTimeReport] = useState<Partial<TimeReport> | undefined>(undefined);

    const addTimeReport = (timeReport: ITimeReportObjectionModel) => {
        if (!currentUser.userId) {
            showCreateFailedNotification('Tidrapporten');
            return;
        }

        const body = { timeReport: timeReport };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + booking.id + '/timeReport', request)
            .then((apiResponse) => getResponseContentOrError<ITimeReportObjectionModel>(apiResponse))
            .then(toTimeReport)
            .then((timeReport) => {
                onAdd(timeReport);
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
