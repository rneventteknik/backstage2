import React from 'react';
import { getStatusColor, getStatusName } from '../../lib/utils';
import { Status } from '../../models/enums/Status';
import { Badge } from '../ui/Badge';

type Props = {
    booking: { status: Status };
    className?: string;
};

const BookingStatusTag: React.FC<Props> = ({ booking, className }: Props) => (
    <Badge style={{ backgroundColor: getStatusColor(booking.status) }} className={className}>
        {getStatusName(booking.status)}
    </Badge>
);
export default BookingStatusTag;
