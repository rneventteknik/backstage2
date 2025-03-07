import React from 'react';
import { Badge } from '../ui/badge';
import { getBookingTypeName } from '../../lib/utils';
import { BookingType } from '../../models/enums/BookingType';

type Props = {
    booking: { bookingType: BookingType };
    className?: string;
};

const BookingTypeTag: React.FC<Props> = ({ booking, className }: Props) => (
    <Badge variant="dark" className={className}>
        {getBookingTypeName(booking.bookingType)}
    </Badge>
);

export default BookingTypeTag;
