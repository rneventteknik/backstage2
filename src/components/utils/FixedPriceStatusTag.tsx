import React from 'react';
import { Badge } from 'react-bootstrap';
import { Booking } from '../../models/interfaces';

type Props = {
    booking: Booking;
    className?: string;
};

const FixedPriceStatusTag: React.FC<Props> = ({ booking, className }: Props) => {
    if (booking.fixedPrice === null) {
        return null;
    }

    if (booking.fixedPrice === 0) {
        return (
            <Badge variant="dark" className={className}>
                Fast pris: Gratis
            </Badge>
        );
    }

    if (booking.fixedPrice > 0) {
        return (
            <Badge variant="dark" className={className}>
                Fast pris
            </Badge>
        );
    }

    return null;
};

export default FixedPriceStatusTag;
