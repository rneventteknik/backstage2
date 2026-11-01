import { Model } from 'objection';
import { Status } from '../../models/enums/Status';
import { ensureDatabaseIsInitialized } from '../database';
import { EquipmentConflictStatus } from '../equipmentConflicts';

export interface EquipmentConflictRow {
    equipmentListId: number;
    equipmentId: number;
    equipmentName: string;
    numberOfUnits: number;
    unitsUsedByOthers: number;
    inventoryCount: number;
    status: EquipmentConflictStatus;
}

export interface EquipmentConflictOverlap {
    equipmentListId: number;
    equipmentId: number;
    otherEquipmentListId: number;
    otherEquipmentListName: string;
    otherBookingId: number;
    equipmentOutDatetime: Date;
    equipmentInDatetime: Date;
    numberOfUnits: number;
}

// The same check as getEquipmentListConflict in lib/equipmentConflicts, run in the database for every equipment list
// and equipment in a booking:
// - Lists without equipment out and in datetimes (falling back to usage datetimes) and equipment without an inventory
//   count are not checked.
// - Other lists overlap a list when they are handed out before or when it is returned, and returned after or when it is
//   handed out. Lists in cancelled bookings are not counted, except for lists in the checked booking itself.
// - unitsUsedByOthers is the most units used by the overlapping lists at the same time, checked at the time each of
//   them is handed out.
// Works on both Postgres and SQLite. SQLite stores datetimes as ISO strings, which compare in the same order.
const conflictCtes = `
WITH booking_equipment AS (
    SELECT DISTINCT e."equipmentId" AS equipment_id
    FROM "EquipmentListEntry" e
    LEFT JOIN "EquipmentListHeading" h ON h.id = e."equipmentListHeadingId"
    JOIN "EquipmentList" l ON l.id = COALESCE(e."equipmentListId", h."equipmentListId")
    WHERE l."bookingId" = :bookingId AND e."equipmentId" IS NOT NULL
),
list_units AS (
    SELECT
        COALESCE(e."equipmentListId", h."equipmentListId") AS list_id,
        e."equipmentId" AS equipment_id,
        SUM(e."numberOfUnits") AS units
    FROM "EquipmentListEntry" e
    LEFT JOIN "EquipmentListHeading" h ON h.id = e."equipmentListHeadingId"
    WHERE e."equipmentId" IN (SELECT equipment_id FROM booking_equipment)
    GROUP BY COALESCE(e."equipmentListId", h."equipmentListId"), e."equipmentId"
),
list_usage AS (
    SELECT
        u.list_id,
        l."bookingId" AS booking_id,
        l."sortIndex" AS sort_index,
        u.equipment_id,
        u.units,
        COALESCE(l."equipmentOutDatetime", l."usageStartDatetime") AS out_at,
        COALESCE(l."equipmentInDatetime", l."usageEndDatetime") AS in_at
    FROM list_units u
    JOIN "EquipmentList" l ON l.id = u.list_id
    WHERE COALESCE(l."equipmentOutDatetime", l."usageStartDatetime") IS NOT NULL
        AND COALESCE(l."equipmentInDatetime", l."usageEndDatetime") IS NOT NULL
),
checked AS (
    SELECT u.*, eq.name AS equipment_name, eq."inventoryCount" AS inventory_count
    FROM list_usage u
    JOIN "Equipment" eq ON eq.id = u.equipment_id
    WHERE u.booking_id = :bookingId AND eq."inventoryCount" IS NOT NULL
),
overlapping AS (
    SELECT
        c.list_id,
        c.equipment_id,
        o.list_id AS other_list_id,
        o.booking_id AS other_booking_id,
        o.units,
        o.out_at,
        o.in_at
    FROM checked c
    JOIN list_usage o
        ON o.equipment_id = c.equipment_id
        AND o.list_id <> c.list_id
        AND o.out_at <= c.in_at
        AND o.in_at >= c.out_at
    JOIN "Booking" b ON b.id = o.booking_id
    WHERE o.booking_id = :bookingId OR b.status <> :canceled
),
others_peak AS (
    SELECT list_id, equipment_id, MAX(units) AS units
    FROM (
        SELECT p.list_id, p.equipment_id, p.other_list_id, SUM(o.units) AS units
        FROM overlapping p
        JOIN overlapping o
            ON o.list_id = p.list_id
            AND o.equipment_id = p.equipment_id
            AND o.out_at <= p.out_at
            AND o.in_at >= p.out_at
        GROUP BY p.list_id, p.equipment_id, p.other_list_id
    ) units_at_out
    GROUP BY list_id, equipment_id
)`;

const rowsQuery = `${conflictCtes}
SELECT
    c.list_id,
    c.equipment_id,
    c.equipment_name,
    c.units,
    c.inventory_count,
    COALESCE(p.units, 0) AS units_used_by_others,
    CASE
        WHEN c.units > c.inventory_count THEN :exceedsInventory
        WHEN c.units + COALESCE(p.units, 0) > c.inventory_count THEN :conflict
        WHEN COALESCE(p.units, 0) > 0 THEN :shared
        ELSE :none
    END AS status
FROM checked c
LEFT JOIN others_peak p ON p.list_id = c.list_id AND p.equipment_id = c.equipment_id
ORDER BY c.sort_index, c.list_id, c.equipment_name, c.equipment_id`;

const overlapsQuery = `${conflictCtes}
SELECT
    o.list_id,
    o.equipment_id,
    o.other_list_id,
    l.name AS other_list_name,
    o.other_booking_id,
    o.out_at,
    o.in_at,
    o.units
FROM overlapping o
JOIN "EquipmentList" l ON l.id = o.other_list_id
ORDER BY CASE WHEN o.other_booking_id = :bookingId THEN 0 ELSE 1 END, o.out_at, o.other_booking_id, o.other_list_id`;

type RawRow = Record<string, unknown>;

// Postgres returns { rows }, better-sqlite3 returns the rows directly.
const runQuery = async (sql: string, bindings: Record<string, string | number>): Promise<RawRow[]> => {
    ensureDatabaseIsInitialized();
    const result = await Model.knex().raw(sql, bindings);
    return Array.isArray(result) ? result : result.rows;
};

// Postgres returns timestamps as dates and sums as strings, SQLite returns ISO strings and numbers.
const toDate = (value: unknown) => (value instanceof Date ? value : new Date(value as string));

export const fetchEquipmentConflictsForBooking = async (
    bookingId: number,
): Promise<{ rows: EquipmentConflictRow[]; overlaps: EquipmentConflictOverlap[] }> => {
    const bindings = {
        bookingId,
        canceled: Status.CANCELED,
        exceedsInventory: EquipmentConflictStatus.EXCEEDS_INVENTORY,
        conflict: EquipmentConflictStatus.CONFLICT,
        shared: EquipmentConflictStatus.SHARED,
        none: EquipmentConflictStatus.NONE,
    };

    const [rows, overlaps] = await Promise.all([
        runQuery(rowsQuery, bindings),
        runQuery(overlapsQuery, { bookingId, canceled: Status.CANCELED }),
    ]);

    return {
        rows: rows.map((x) => ({
            equipmentListId: Number(x.list_id),
            equipmentId: Number(x.equipment_id),
            equipmentName: x.equipment_name as string,
            numberOfUnits: Number(x.units),
            unitsUsedByOthers: Number(x.units_used_by_others),
            inventoryCount: Number(x.inventory_count),
            status: x.status as EquipmentConflictStatus,
        })),
        overlaps: overlaps.map((x) => ({
            equipmentListId: Number(x.list_id),
            equipmentId: Number(x.equipment_id),
            otherEquipmentListId: Number(x.other_list_id),
            otherEquipmentListName: x.other_list_name as string,
            otherBookingId: Number(x.other_booking_id),
            equipmentOutDatetime: toDate(x.out_at),
            equipmentInDatetime: toDate(x.in_at),
            numberOfUnits: Number(x.units),
        })),
    };
};
