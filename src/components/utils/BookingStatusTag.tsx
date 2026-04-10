import React from 'react';
import { getStatusColor, getStatusName } from '../../lib/utils';
import { Status } from '../../models/enums/Status';

type Props = {
    booking: { status: Status };
    className?: string;
};

const BookingStatusTag: React.FC<Props> = ({ booking, className }: Props) => (
    <span
        style={{ backgroundColor: getStatusColor(booking.status) }}
        className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-white ${className ?? ''}`}
    >
        {getStatusName(booking.status)}
    </span>
);
export default BookingStatusTag;
