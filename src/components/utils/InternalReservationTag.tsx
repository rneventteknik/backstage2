import React from 'react';

type Props = {
    booking: { internalReservation: boolean };
    className?: string;
};

const InternalReservationTag: React.FC<Props> = ({ booking, className }: Props) =>
    booking.internalReservation ? (
        <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-bs-2 text-body ${className ?? ''}`}>
            Intern reservation
        </span>
    ) : null;
export default InternalReservationTag;
