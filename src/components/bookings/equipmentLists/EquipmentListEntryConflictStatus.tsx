import { faCheck, faWarning } from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import useSwr from 'swr';
import { bookingsFetcher } from '../../../lib/fetchers';
import { getMaximumNumberOfUnitUsed, listContainsEquipment } from '../../../lib/utils';
import { Status } from '../../../models/enums/Status';
import { Equipment } from '../../../models/interfaces';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { getEquipmentInDatetime, getEquipmentOutDatetime } from '../../../lib/datetimeUtils';

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

    // Check local lists in client for conflicts. These override the remote lists if they have the same id.
    const startTime = getEquipmentOutDatetime(equipmentList);
    const endTime = getEquipmentInDatetime(equipmentList);

    const localOverlappingLists = otherLists
        .filter((list) => listContainsEquipment(list, equipment))
        .filter((list) => {
            const equipmentOut = getEquipmentOutDatetime(list);
            const equipmentIn = getEquipmentInDatetime(list);

            if (!equipmentOut || !equipmentIn || !startTime || !endTime) {
                return false;
            }

            return equipmentOut <= endTime && equipmentIn >= startTime;
        });

    // Filter bookings
    const bookings = data?.filter((x) => x.status !== Status.CANCELED) ?? [];

    // Sum the number of units used locally
    const numberOfUnitsUsedByThisList = getMaximumNumberOfUnitUsed([equipmentList], equipment);

    // Calculate the max number of units used at the same time.
    const remoteOverlappingEquipmentLists = bookings
        .flatMap((x) => x.equipmentLists ?? [])
        .filter((list) => !otherLists.some((x) => x.id === list.id));
    const overlappingEquipmentLists = [...localOverlappingLists, ...remoteOverlappingEquipmentLists];
    const numberOfUnitsUsedByOthers = getMaximumNumberOfUnitUsed(overlappingEquipmentLists, equipment);
    const maxNumberOfUnitsUsed = numberOfUnitsUsedByOthers + numberOfUnitsUsedByThisList;

    if (numberOfUnitsUsedByOthers === 0 && numberOfUnitsUsedByThisList <= equipment.inventoryCount) {
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

    if (numberOfUnitsUsedByThisList > equipment.inventoryCount) {
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

    if (maxNumberOfUnitsUsed > equipment.inventoryCount) {
        return (
            <OverlayTrigger
                placement="right"
                overlay={
                    <Tooltip id="1">
                        <strong>
                            Totalt används fler av denna utrustning än vad som finns ({maxNumberOfUnitsUsed}/
                            {equipment.inventoryCount} st). Konflikterande utrustningslistor:
                        </strong>
                        {bookings.map((booking) => (
                            <div key={booking.id}>
                                <div>{booking.name}</div>
                                <div className="text-small font-italic">
                                    {booking.equipmentLists
                                        ?.map(
                                            (list) =>
                                                `${list.name} (${getMaximumNumberOfUnitUsed([list], equipment)} st)`,
                                        )
                                        ?.join(', ')}
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
                    {bookings.map((booking) => (
                        <div key={booking.id}>
                            <div>{booking.name}</div>
                            <div className="text-small font-italic">
                                {booking.equipmentLists
                                    ?.map(
                                        (list) => `${list.name} (${getMaximumNumberOfUnitUsed([list], equipment)} st)`,
                                    )
                                    ?.join(', ')}
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
