import { faCheck, faWarning } from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import useSwr from 'swr';
import { bookingsFetcher } from '../../../lib/fetchers';
import { EquipmentConflictStatus, getEquipmentListConflict } from '../../../lib/equipmentConflicts';
import { getMaximumNumberOfUnitUsedInBooking } from '../../../lib/utils';
import { Equipment } from '../../../models/interfaces';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';

type Props = {
    equipment: Equipment;
    equipmentList: EquipmentList;
    otherLists: EquipmentList[];
    startDatetime: Date;
    endDatetime: Date;
};

const EquipmentListEntryConflictStatus: React.FC<Props> = ({
    equipment,
    startDatetime,
    endDatetime,
    equipmentList,
    otherLists,
}: Props) => {
    const { data, error, isValidating } = useSwr(
        '/api/conflict-detection/booking-with-equipment?equipmentId=' +
            equipment.id +
            '&startDatetime=' +
            startDatetime.toISOString() +
            '&endDatetime=' +
            endDatetime.toISOString() +
            '&ignoreEquipmentListId=' +
            equipmentList.id,
        bookingsFetcher,
    );

    if (isValidating && !data) {
        return (
            <span>
                <Skeleton width={12} height={12} />
            </span>
        );
    }

    if (equipment.inventoryCount === null) {
        return null;
    }

    if (error) {
        return (
            <span className="text-danger">
                {' '}
                <OverlayTrigger
                    placement="right"
                    overlay={
                        <Tooltip id="1">
                            <strong>Inventariestatus kunde inte hämtas.</strong>
                            <div>{error.message}</div>
                        </Tooltip>
                    }
                >
                    <FontAwesomeIcon icon={faWarning} />
                </OverlayTrigger>
            </span>
        );
    }

    const conflict = getEquipmentListConflict(equipmentList, equipment, otherLists, data ?? []);

    // The overlapping lists, grouped per booking. Lists in this booking are taken from the client, since they may have
    // unsaved changes.
    const overlappingBookings = [
        ...(conflict.overlappingLocalLists.length > 0
            ? [{ key: 'local', name: 'Denna bokning', lists: conflict.overlappingLocalLists }]
            : []),
        ...conflict.overlappingRemoteBookings.map((x) => ({ key: x.booking.id, name: x.booking.name, lists: x.lists })),
    ];
    if (conflict.status === EquipmentConflictStatus.NONE) {
        return (
            <OverlayTrigger
                placement="right"
                overlay={
                    <Tooltip id="1">
                        <strong>
                            Inga konflikter (ingen annat bokning använder denna utrustningen dessa tider, totalt finns{' '}
                            {equipment.inventoryCount} st)
                        </strong>
                    </Tooltip>
                }
            >
                <FontAwesomeIcon icon={faCheck} />
            </OverlayTrigger>
        );
    }

    if (conflict.status === EquipmentConflictStatus.EXCEEDS_INVENTORY) {
        return (
            <OverlayTrigger
                placement="right"
                overlay={
                    <Tooltip id="1">
                        <strong>
                            Denna utrustningslista använder fler av denna utrustning än vad som finns (
                            {equipment.inventoryCount} st).
                        </strong>
                    </Tooltip>
                }
            >
                <FontAwesomeIcon icon={faWarning} />
            </OverlayTrigger>
        );
    }

    if (conflict.status === EquipmentConflictStatus.CONFLICT) {
        return (
            <OverlayTrigger
                placement="right"
                overlay={
                    <Tooltip id="1">
                        <strong>
                            Totalt används fler av denna utrustning än vad som finns ({conflict.maxUnitsUsed}/
                            {equipment.inventoryCount} st). Konflikterande utrustningslistor:
                        </strong>
                        {overlappingBookings.map((booking) => (
                            <div key={booking.key}>
                                <div>{booking.name}</div>
                                <div className="text-small font-italic">
                                    {booking.lists
                                        .map(
                                            (list) =>
                                                `${list.name} (${getMaximumNumberOfUnitUsedInBooking([list], equipment)} st)`,
                                        )
                                        .join(', ')}
                                </div>
                            </div>
                        ))}
                    </Tooltip>
                }
            >
                <FontAwesomeIcon icon={faWarning} />
            </OverlayTrigger>
        );
    }

    return (
        <OverlayTrigger
            placement="right"
            overlay={
                <Tooltip id="1">
                    <strong>
                        Notera att samma typ av utrustning används samma tid av följande andra utrustningslistor (totalt
                        finns {equipment.inventoryCount} st):
                    </strong>
                    {overlappingBookings.map((booking) => (
                        <div key={booking.key}>
                            <div>{booking.name}</div>
                            <div className="text-small font-italic">
                                {booking.lists
                                    .map(
                                        (list) =>
                                            `${list.name} (${getMaximumNumberOfUnitUsedInBooking([list], equipment)} st)`,
                                    )
                                    .join(', ')}
                            </div>
                        </div>
                    ))}
                </Tooltip>
            }
        >
            <FontAwesomeIcon icon={faCircleCheck} />
        </OverlayTrigger>
    );
};

export default EquipmentListEntryConflictStatus;
