import React from 'react';
import { Badge } from 'react-bootstrap';
import { BookingType } from '../../models/enums/BookingType';

type Props = {
    booking: { bookingType: BookingType };
    className?: string;
};

const BookingTypeTag: React.FC<Props> = ({ booking, className }: Props) => {
    switch (booking && booking.bookingType) {
        case BookingType.GIG:
            return (
                <Badge variant="success" className={className}>
                    Gigg
                </Badge>
            );
        case BookingType.RENTAL:
            return (
                <Badge variant="primary" className={className}>
                    Hyra
                </Badge>
            );
        default:
            return null;
    }
};

export default BookingTypeTag;
