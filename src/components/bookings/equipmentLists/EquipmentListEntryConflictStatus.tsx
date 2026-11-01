import { faCheck, faWarning } from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import { EquipmentConflictStatus, EquipmentListConflict } from '../../../lib/equipmentConflicts';
import { Equipment } from '../../../models/interfaces';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';

type Props = {
    equipment: Equipment;
    equipmentList: EquipmentList;
    // The conflicts of every list in the booking, from useEquipmentConflicts.
    equipmentConflicts: EquipmentListConflict[] | undefined;
    error: Error | undefined;
};

const EquipmentListEntryConflictStatus: React.FC<Props> = ({
    equipment,
    equipmentList,
    equipmentConflicts,
    error,
}: Props) => {
    if (equipment.inventoryCount === null) {
        return null;
    }

    if (error && !equipmentConflicts) {
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

    const conflict = equipmentConflicts?.find(
        (x) => x.equipmentListId === equipmentList.id && x.equipmentId === equipment.id,
    );

    // Rows are missing until the conflicts have loaded, and briefly after a change until they are reloaded.
    if (!conflict) {
        return (
            <span>
                <Skeleton width={12} height={12} />
            </span>
        );
    }

    const overlappingBookings = conflict.overlappingBookings.map((booking) => ({
        key: booking.id,
        name: booking.id === conflict.bookingId ? 'Denna bokning' : booking.name,
        lists: booking.equipmentLists,
    }));

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
                                    {booking.lists.map((list) => `${list.name} (${list.numberOfUnits} st)`).join(', ')}
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
                                {booking.lists.map((list) => `${list.name} (${list.numberOfUnits} st)`).join(', ')}
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
