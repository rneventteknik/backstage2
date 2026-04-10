import React from 'react';
import { getBookingTypeName } from '../../lib/utils';
import { BookingType } from '../../models/enums/BookingType';

type Props = {
    booking: { bookingType: BookingType };
    className?: string;
};

const BookingTypeTag: React.FC<Props> = ({ booking, className }: Props) => (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-bs-2 text-body ${className ?? ''}`}>
        {getBookingTypeName(booking.bookingType)}
    </span>
);

export default BookingTypeTag;
