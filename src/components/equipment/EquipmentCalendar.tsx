import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Card, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import useSwr from 'swr';
import { addDays, formatDate } from '../../lib/datetimeUtils';
import { bookingsFetcher } from '../../lib/fetchers';
import { getMaximumNumberOfUnitUsed } from '../../lib/utils';
import { Status } from '../../models/enums/Status';
import { Equipment } from '../../models/interfaces';
import styles from './EquipmentCalendar.module.scss';

type Props = {
    equipment: Equipment;
};

const EquipmentCalendar: React.FC<Props> = ({ equipment }: Props) => {
    const dayOffsets = [0, 1, 2, 3, 4, 5, 6];
    const dayLabels = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];

    const thisWeek = new Date();
    thisWeek.setHours(0, 0, 0, 0); // Reset time part
    thisWeek.setDate(thisWeek.getDate() - ((thisWeek.getDay() + 6) % 7)); // Go to last Monday

    // Calculate next week and some more weeks for the dropdown
    const nextWeek = addDays(thisWeek, 7);
    const moreWeeks = [2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => addDays(thisWeek, 7 * x));

    const [startDate, setStartDate] = useState(thisWeek);

    // Based on the selected start date, calculate the dates to show in the view
    const days = dayOffsets.map((x) => ({
        startDatetime: addDays(startDate, x),
        endDatetime: addDays(startDate, x + 1),
        label: dayLabels[x],
        secondaryLabel: formatDate(addDays(startDate, x)),
    }));

    if (!equipment) {
        return <Skeleton height={120}></Skeleton>;
    }

    return (
        <>
            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex">
                        <div className="flex-grow-1">
                            Tillgänglighet<div className="text-muted">Minsta tillgängliga antal per dag</div>
                        </div>
                        <div>
                            <Form.Control
                                as="select"
                                name="paymentStatus"
                                defaultValue={thisWeek.getTime()}
                                onChange={(e) => setStartDate(new Date(parseInt(e.target.value)))}
                                size="sm"
                            >
                                <option value={thisWeek.getTime()}>Denna veckan</option>
                                <option value={nextWeek.getTime()}>Nästa vecka</option>
                                {moreWeeks.map((week, i) => (
                                    <option value={week.getTime()} key={i}>
                                        {formatDate(week)} till {formatDate(addDays(week, 6))}
                                    </option>
                                ))}
                            </Form.Control>
                        </div>
                    </div>
                </Card.Header>
                <div className="d-flex">
                    {days.map((d) => (
                        <div className={styles.statusContainer} key={d.label}>
                            <EquipmentCalendarDay
                                equipment={equipment}
                                label={d.label}
                                secondaryLabel={d.secondaryLabel}
                                startDatetime={d.startDatetime}
                                endDatetime={d.endDatetime}
                            />
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
};

type EquipmentCalendarDayProps = {
    equipment: Equipment;
    label: string;
    secondaryLabel: string;
    startDatetime: Date;
    endDatetime: Date;
};

const EquipmentCalendarDay: React.FC<EquipmentCalendarDayProps> = ({
    equipment,
    startDatetime,
    endDatetime,
    label,
    secondaryLabel,
}: EquipmentCalendarDayProps) => {
    const { data, error, isValidating } = useSwr(
        '/api/conflict-detection/booking-with-equipment?equipmentId=' +
            equipment.id +
            '&startDatetime=' +
            startDatetime.toISOString() +
            '&endDatetime=' +
            endDatetime.toISOString(),
        bookingsFetcher,
    );

    if (isValidating && !equipment) {
        return <Skeleton height={80} />;
    }

    if (error) {
        return <span className="text-danger">Fel!</span>;
    }

    // Filter bookings
    const bookings = data?.filter((x) => x.status !== Status.CANCELED) ?? [];

    // Calculate the max number of equipment used at the same time.
    const equipmentLists = bookings.flatMap((x) => x.equipmentLists ?? []);
    const maxNumberOfUnitsUsed = getMaximumNumberOfUnitUsed(equipmentLists, equipment);

    const getClassName = () => {
        if (maxNumberOfUnitsUsed === 0) {
            return styles.allAvailable;
        }

        if (maxNumberOfUnitsUsed > 0 && maxNumberOfUnitsUsed < equipment.inventoryCount) {
            return styles.someAvailable + ' text-dark';
        }

        if (maxNumberOfUnitsUsed === equipment.inventoryCount) {
            return styles.noneAvailable + ' text-dark';
        }

        if (maxNumberOfUnitsUsed > equipment.inventoryCount) {
            return styles.overbooked;
        }

        return null;
    };

    return (
        <div className={'p-2 flex-grow-1 ' + getClassName()}>
            <div
                className={
                    'text-center mb-2' +
                    (Date.now() < endDatetime.getTime() && Date.now() > startDatetime.getTime()
                        ? ' font-weight-bold'
                        : '')
                }
                title={secondaryLabel}
            >
                {label}
            </div>

            <div className="text-center py-2">
                {maxNumberOfUnitsUsed === 0 ? (
                    <FontAwesomeIcon icon={faCheck} size="lg" />
                ) : (
                    <OverlayTrigger
                        placement="left"
                        overlay={
                            <Tooltip id="1">
                                {bookings.map((booking) => (
                                    <div key={booking.id}>
                                        <div>{booking.name}</div>
                                        <div className="text-small font-italic">
                                            {booking.equipmentLists
                                                ?.map(
                                                    (list) =>
                                                        `${list.name} (${list.equipmentListEntries
                                                            .filter((x) => x.equipmentId === equipment.id)
                                                            .reduce((sum, x) => sum + x.numberOfUnits, 0)} st)`,
                                                )
                                                ?.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </Tooltip>
                        }
                    >
                        <span>
                            {equipment.inventoryCount - maxNumberOfUnitsUsed}&nbsp;/&nbsp;{equipment.inventoryCount}
                        </span>
                    </OverlayTrigger>
                )}
            </div>
        </div>
    );
};

export default EquipmentCalendar;
