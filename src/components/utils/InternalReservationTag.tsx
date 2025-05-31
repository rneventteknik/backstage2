import React from 'react';
import { Badge } from 'react-bootstrap';

type Props = {
    booking: { internalReservation: boolean };
    className?: string;
};

const InternalReservationTag: React.FC<Props> = ({ booking, className }: Props) =>
    booking.internalReservation ? (
        <Badge className={className} variant="dark">
            Intern reservation
        </Badge>
    ) : null;
export default InternalReservationTag;
