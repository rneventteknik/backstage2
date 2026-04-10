import React from 'react';
import { Booking } from '../../models/interfaces';

type Props = {
    booking: Booking;
    className?: string;
};

const tagClass = 'inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-bs-2 text-body';

const FixedPriceStatusTag: React.FC<Props> = ({ booking, className }: Props) => {
    if (booking.fixedPrice === null) return null;
    if (booking.fixedPrice === 0) return <span className={`${tagClass} ${className ?? ''}`}>Fast pris: Gratis</span>;
    if (booking.fixedPrice > 0) return <span className={`${tagClass} ${className ?? ''}`}>Fast pris</span>;
    return null;
};

export default FixedPriceStatusTag;
