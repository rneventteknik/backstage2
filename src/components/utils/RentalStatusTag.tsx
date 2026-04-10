import React from 'react';
import { RentalStatus } from '../../models/enums/RentalStatus';

type Props = {
    booking: { equipmentLists?: { rentalStatus?: RentalStatus | null }[] };
    className?: string;
};

const tagClass = 'inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-bs-2 text-body';

const RentalStatusTag: React.FC<Props> = ({ booking, className }: Props) => {
    if (!booking.equipmentLists || booking.equipmentLists.length == 0) return null;

    if (booking.equipmentLists.every((x) => x.rentalStatus === RentalStatus.RETURNED))
        return <span className={`${tagClass} ${className ?? ''}`}>Återlämnad</span>;

    if (booking.equipmentLists.every((x) => x.rentalStatus === RentalStatus.OUT || x.rentalStatus === RentalStatus.RETURNED))
        return <span className={`${tagClass} ${className ?? ''}`}>Utlämnad</span>;

    if (booking.equipmentLists.some((x) => x.rentalStatus === RentalStatus.OUT || x.rentalStatus === RentalStatus.RETURNED))
        return <span className={`${tagClass} ${className ?? ''}`}>Delvis utlämnad</span>;

    return null;
};

export default RentalStatusTag;
