import router from 'next/router';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import useSwr from 'swr';
import { toBookingViewModel } from '../../lib/datetimeUtils';
import { bookingsFetcher } from '../../lib/fetchers';
import { listContainsEquipment } from '../../lib/utils';
import { RentalStatus } from '../../models/enums/RentalStatus';
import { BookingViewModel, Equipment } from '../../models/interfaces';
import SmallBookingTable from '../SmallBookingTable';

type Props = {
    equipment: Equipment;
};

const EquipmentBookings: React.FC<Props> = ({ equipment }: Props) => {
    const { data: bookings } = useSwr('/api/equipment/' + router.query.id + '/bookings', bookingsFetcher);

    const bookingViewModels = bookings?.map(toBookingViewModel) ?? [];

    const bookingHasNonReturnedListWithEquipment = (booking: BookingViewModel) =>
        booking.equipmentLists?.some(
            (list) => list.rentalStatus === RentalStatus.OUT && listContainsEquipment(list, equipment),
        );

    const currentBookings = bookingViewModels.filter(
        (x) =>
            (x.equipmentOutDatetime &&
                x.equipmentInDatetime &&
                x.equipmentOutDatetime.getTime() < Date.now() &&
                x.equipmentInDatetime.getTime() > Date.now()) ||
            bookingHasNonReturnedListWithEquipment(x),
    );
    const futureBookings = bookingViewModels.filter(
        (x) =>
            x.equipmentOutDatetime &&
            x.equipmentInDatetime &&
            x.equipmentOutDatetime.getTime() > Date.now() &&
            x.equipmentInDatetime.getTime() > Date.now() &&
            !bookingHasNonReturnedListWithEquipment(x),
    );
    const pastBookings = bookingViewModels
        .filter(
            (x) =>
                x.equipmentOutDatetime &&
                x.equipmentInDatetime &&
                x.equipmentOutDatetime.getTime() < Date.now() &&
                x.equipmentInDatetime.getTime() < Date.now() &&
                !bookingHasNonReturnedListWithEquipment(x),
        )
        .slice(0, 10);

    if (!equipment || !bookings) {
        return <Skeleton height={120}></Skeleton>;
    }

    return (
        <>
            <SmallBookingTable
                title={'Pågående eller utlämnade bokningar'}
                bookings={currentBookings}
                tableSettingsOverride={{ noResultsLabel: 'Inga pågående bokningar använder ' + equipment.name }}
            />
            <SmallBookingTable
                title={'Kommande bokningar'}
                bookings={futureBookings}
                tableSettingsOverride={{ noResultsLabel: 'Inga kommande bokningar med ' + equipment.name }}
            />
            <SmallBookingTable
                title={'Senaste 10 bokningarna som använt ' + equipment.name}
                bookings={pastBookings}
                tableSettingsOverride={{
                    defaultSortAscending: false,
                    noResultsLabel: 'Inga bokningar har använt ' + equipment.name,
                }}
            />
        </>
    );
};

export default EquipmentBookings;
