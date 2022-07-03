import React from 'react';
import { Badge } from 'react-bootstrap';
import { RentalStatus } from '../../models/enums/RentalStatus';

type Props = {
    booking: { equipmentLists?: { rentalStatus?: RentalStatus | null }[] };
    className?: string;
};

const RentalStatusTag: React.FC<Props> = ({ booking, className }: Props) => {
    if (!booking.equipmentLists || booking.equipmentLists.length == 0) {
        return null;
    }

    if (booking.equipmentLists.every((x) => x.rentalStatus === RentalStatus.RETURNED)) {
        return (
            <Badge variant="dark" className={className}>
                Återlämnad
            </Badge>
        );
    }

    if (
        booking.equipmentLists.every(
            (x) => x.rentalStatus === RentalStatus.OUT || x.rentalStatus === RentalStatus.RETURNED,
        )
    ) {
        return (
            <Badge variant="dark" className={className}>
                Utlämnad
            </Badge>
        );
    }

    if (
        booking.equipmentLists.some(
            (x) => x.rentalStatus === RentalStatus.OUT || x.rentalStatus === RentalStatus.RETURNED,
        )
    ) {
        return (
            <Badge variant="dark" className={className}>
                Delvis utlämnad
            </Badge>
        );
    }

    return null;
};

export default RentalStatusTag;
