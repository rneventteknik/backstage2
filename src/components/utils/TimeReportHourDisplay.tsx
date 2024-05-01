import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TimeReport } from '../../models/interfaces';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    timeReport: TimeReport;
};

const TimeReportHourDisplay: React.FC<Props> = ({ timeReport }: Props) => {
    return (
        <>
            {timeReport.billableWorkingHours} h
            {timeReport.actualWorkingHours !== timeReport.billableWorkingHours ? (
                <OverlayTrigger
                    overlay={
                        <Tooltip id="1">
                            Antalet fakturerade timmar ({timeReport.billableWorkingHours} h) skiljer sig från antalet
                            arbetade timmar ({timeReport.actualWorkingHours} h).
                        </Tooltip>
                    }
                >
                    <FontAwesomeIcon className="ml-1" icon={faInfoCircle} />
                </OverlayTrigger>
            ) : null}
        </>
    );
};

export default TimeReportHourDisplay;
