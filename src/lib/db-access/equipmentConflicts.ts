import { Model } from 'objection';
import { RentalStatus } from '../../models/enums/RentalStatus';
import { Status } from '../../models/enums/Status';
import { ensureDatabaseIsInitialized, getDatabaseType } from '../database';
import {
    EquipmentConflictStatus,
    EquipmentListConflict,
    EquipmentUsage,
    EquipmentUsageBooking,
} from '../equipmentConflicts';

// All equipment conflict detection and unit counting in Backstage2 runs through the SQL below, so the rules only exist
// in one place. It runs on both Postgres and SQLite; SQLite stores datetimes as ISO strings, which compare in order.
//
// The rules:
// - A list uses the equipment from its equipment out to its equipment in datetime, falling back to the usage start and
//   end datetimes. Lists without both are not counted.
// - Both ends are inclusive, so a list returned at the same time as another is handed out overlaps it.
// - The units a list uses are the sum of its rows with the equipment, including rows under headings.
// - The most units used at the same time by a set of lists is checked at the time each of them is handed out.
// - Lists in cancelled bookings are not counted, except in the booking being checked (or when includeCancelled is 1).
//
// Each query checks a set of subjects: an equipment during a period (from_at to to_at, open-ended when null). A subject
// can exclude one list (the list being checked) and name its own booking (whose lists count even when cancelled).
// The caller provides the subjects CTE and the equipment it covers; the CTEs below find the lists using the equipment
// during each subject's period (usage) and the most units they use at the same time, in total (peaks) and per
// booking (booking_peaks).
const usageCtes = (equipmentSql: string, subjectsSql: string) => `
WITH relevant_equipment AS (
    ${equipmentSql}
),
list_units AS (
    SELECT
        COALESCE(e."equipmentListId", h."equipmentListId") AS list_id,
        e."equipmentId" AS equipment_id,
        COALESCE(SUM(e."numberOfUnits"), 0) AS units
    FROM "EquipmentListEntry" e
    LEFT JOIN "EquipmentListHeading" h ON h.id = e."equipmentListHeadingId"
    WHERE e."equipmentId" IN (SELECT equipment_id FROM relevant_equipment)
    GROUP BY COALESCE(e."equipmentListId", h."equipmentListId"), e."equipmentId"
),
list_usage AS (
    SELECT
        u.list_id,
        u.equipment_id,
        u.units,
        l.name AS list_name,
        l."rentalStatus" AS rental_status,
        l."sortIndex" AS sort_index,
        l."bookingId" AS booking_id,
        b.name AS booking_name,
        b.status AS booking_status,
        COALESCE(l."equipmentOutDatetime", l."usageStartDatetime") AS out_at,
        COALESCE(l."equipmentInDatetime", l."usageEndDatetime") AS in_at
    FROM list_units u
    JOIN "EquipmentList" l ON l.id = u.list_id
    JOIN "Booking" b ON b.id = l."bookingId"
    WHERE COALESCE(l."equipmentOutDatetime", l."usageStartDatetime") IS NOT NULL
        AND COALESCE(l."equipmentInDatetime", l."usageEndDatetime") IS NOT NULL
),
subjects AS (
    ${subjectsSql}
),
usage AS (
    SELECT s.subject_id, s.own_booking_id, u.*
    FROM subjects s
    JOIN list_usage u ON u.equipment_id = s.equipment_id
    WHERE (s.excluded_list_id IS NULL OR u.list_id <> s.excluded_list_id)
        AND (s.to_at IS NULL OR u.out_at <= s.to_at)
        AND (s.from_at IS NULL OR u.in_at >= s.from_at)
        AND (:includeCancelled = 1 OR u.booking_status <> :canceled OR u.booking_id = s.own_booking_id)
),
peaks AS (
    SELECT subject_id, MAX(units) AS units
    FROM (
        SELECT p.subject_id, p.list_id, SUM(o.units) AS units
        FROM usage p
        JOIN usage o
            ON o.subject_id = p.subject_id
            AND o.out_at <= p.out_at
            AND o.in_at >= p.out_at
        GROUP BY p.subject_id, p.list_id
    ) units_at_out
    GROUP BY subject_id
),
booking_peaks AS (
    SELECT subject_id, booking_id, MAX(units) AS units
    FROM (
        SELECT p.subject_id, p.booking_id, p.list_id, SUM(o.units) AS units
        FROM usage p
        JOIN usage o
            ON o.subject_id = p.subject_id
            AND o.booking_id = p.booking_id
            AND o.out_at <= p.out_at
            AND o.in_at >= p.out_at
        GROUP BY p.subject_id, p.booking_id, p.list_id
    ) units_at_out
    GROUP BY subject_id, booking_id
)`;

// The lists in usage, with the peak of their booking. The subject's own booking comes first.
const usageSelect = `
SELECT us.*, bp.units AS booking_units
FROM usage us
JOIN booking_peaks bp ON bp.subject_id = us.subject_id AND bp.booking_id = us.booking_id
ORDER BY
    us.subject_id,
    CASE WHEN us.booking_id = us.own_booking_id THEN 0 ELSE 1 END,
    us.out_at,
    us.booking_id,
    us.sort_index,
    us.list_id`;

// Every equipment with an inventory count on every list in the booking, checked against the other lists using it
// during the list.
const bookingConflictCtes = usageCtes(
    `SELECT DISTINCT e."equipmentId" AS equipment_id
    FROM "EquipmentListEntry" e
    LEFT JOIN "EquipmentListHeading" h ON h.id = e."equipmentListHeadingId"
    JOIN "EquipmentList" l ON l.id = COALESCE(e."equipmentListId", h."equipmentListId")
    WHERE l."bookingId" = :bookingId AND e."equipmentId" IS NOT NULL`,
    `SELECT
        ROW_NUMBER() OVER (ORDER BY u.list_id, u.equipment_id) AS subject_id,
        u.equipment_id,
        u.list_id,
        u.out_at AS from_at,
        u.in_at AS to_at,
        u.booking_id AS own_booking_id,
        u.list_id AS excluded_list_id
    FROM list_usage u
    JOIN "Equipment" eq ON eq.id = u.equipment_id
    WHERE u.booking_id = :bookingId AND eq."inventoryCount" IS NOT NULL`,
);

const bookingConflictsQuery = `${bookingConflictCtes}
SELECT
    s.subject_id,
    s.own_booking_id AS booking_id,
    s.list_id,
    s.equipment_id,
    eq.name AS equipment_name,
    eq."inventoryCount" AS inventory_count,
    c.units,
    COALESCE(p.units, 0) AS units_used_by_others,
    CASE
        WHEN c.units > eq."inventoryCount" THEN :exceedsInventory
        WHEN c.units + COALESCE(p.units, 0) > eq."inventoryCount" THEN :conflict
        WHEN COALESCE(p.units, 0) > 0 THEN :shared
        ELSE :none
    END AS status
FROM subjects s
JOIN list_usage c ON c.list_id = s.list_id AND c.equipment_id = s.equipment_id
JOIN "Equipment" eq ON eq.id = s.equipment_id
LEFT JOIN peaks p ON p.subject_id = s.subject_id
ORDER BY c.sort_index, s.list_id, eq.name, s.equipment_id`;

const bookingConflictsUsageQuery = `${bookingConflictCtes}
${usageSelect}`;

// Postgres needs the type of a datetime parameter that is not compared to a column directly.
const datetimeParameter = (name: string) =>
    getDatabaseType() === 'postgres' ? `CAST(:${name} AS timestamptz)` : `:${name}`;

const equipmentUsageQuery = () => `${usageCtes(
    'SELECT CAST(:equipmentId AS INTEGER) AS equipment_id',
    `SELECT
        1 AS subject_id,
        CAST(:equipmentId AS INTEGER) AS equipment_id,
        CAST(NULL AS INTEGER) AS list_id,
        ${datetimeParameter('from')} AS from_at,
        ${datetimeParameter('to')} AS to_at,
        CAST(NULL AS INTEGER) AS own_booking_id,
        CAST(NULL AS INTEGER) AS excluded_list_id`,
)}
SELECT us.*, bp.units AS booking_units, p.units AS max_units
FROM usage us
JOIN booking_peaks bp ON bp.subject_id = us.subject_id AND bp.booking_id = us.booking_id
JOIN peaks p ON p.subject_id = us.subject_id
ORDER BY us.out_at, us.booking_id, us.sort_index, us.list_id`;

// Same as equipmentUsageQuery, but only with the peaks per booking, which is much cheaper over long periods.
const equipmentUsagePerBookingQuery = () => `${usageCtes(
    'SELECT CAST(:equipmentId AS INTEGER) AS equipment_id',
    `SELECT
        1 AS subject_id,
        CAST(:equipmentId AS INTEGER) AS equipment_id,
        CAST(NULL AS INTEGER) AS list_id,
        ${datetimeParameter('from')} AS from_at,
        ${datetimeParameter('to')} AS to_at,
        CAST(NULL AS INTEGER) AS own_booking_id,
        CAST(NULL AS INTEGER) AS excluded_list_id`,
)}
SELECT booking_id, units FROM booking_peaks`;

type RawRow = Record<string, unknown>;
type Bindings = Record<string, string | number | null>;

// Postgres returns { rows }, better-sqlite3 returns the rows directly.
const runQuery = async (sql: string, bindings: Bindings): Promise<RawRow[]> => {
    ensureDatabaseIsInitialized();
    const result = await Model.knex().raw(sql, { canceled: Status.CANCELED, includeCancelled: 0, ...bindings });
    return Array.isArray(result) ? result : result.rows;
};

// Postgres returns timestamps as dates and big integers as strings, SQLite returns ISO strings and numbers.
const toDate = (value: unknown) => (value instanceof Date ? value : new Date(value as string));
const toNumber = (value: unknown) => Number(value);

// Groups the rows of usageSelect into bookings, keeping their order.
const toEquipmentUsageBookings = (rows: RawRow[]): EquipmentUsageBooking[] => {
    const bookings = new Map<number, EquipmentUsageBooking>();
    rows.forEach((row) => {
        const bookingId = toNumber(row.booking_id);
        const booking = bookings.get(bookingId) ?? {
            id: bookingId,
            name: row.booking_name as string,
            status: toNumber(row.booking_status) as Status,
            maxUnitsUsed: toNumber(row.booking_units),
            equipmentLists: [],
        };
        booking.equipmentLists.push({
            id: toNumber(row.list_id),
            name: row.list_name as string,
            rentalStatus: row.rental_status != null ? (toNumber(row.rental_status) as RentalStatus) : null,
            equipmentOutDatetime: toDate(row.out_at),
            equipmentInDatetime: toDate(row.in_at),
            numberOfUnits: toNumber(row.units),
        });
        bookings.set(bookingId, booking);
    });
    return [...bookings.values()];
};

const groupBySubject = (rows: RawRow[]) => {
    const rowsBySubject = new Map<number, RawRow[]>();
    rows.forEach((row) => {
        const subjectId = toNumber(row.subject_id);
        rowsBySubject.set(subjectId, [...(rowsBySubject.get(subjectId) ?? []), row]);
    });
    return rowsBySubject;
};

// The conflict status of every equipment with an inventory count on every list in the booking with equipment out and
// in datetimes, ordered like the lists.
export const fetchEquipmentConflictsForBooking = async (bookingId: number): Promise<EquipmentListConflict[]> => {
    const [rows, usageRows] = await Promise.all([
        runQuery(bookingConflictsQuery, {
            bookingId,
            exceedsInventory: EquipmentConflictStatus.EXCEEDS_INVENTORY,
            conflict: EquipmentConflictStatus.CONFLICT,
            shared: EquipmentConflictStatus.SHARED,
            none: EquipmentConflictStatus.NONE,
        }),
        runQuery(bookingConflictsUsageQuery, { bookingId }),
    ]);
    const usageRowsBySubject = groupBySubject(usageRows);

    return rows.map((row) => {
        const numberOfUnits = toNumber(row.units);
        const unitsUsedByOthers = toNumber(row.units_used_by_others);
        return {
            bookingId: toNumber(row.booking_id),
            equipmentListId: toNumber(row.list_id),
            equipmentId: toNumber(row.equipment_id),
            equipmentName: row.equipment_name as string,
            inventoryCount: toNumber(row.inventory_count),
            numberOfUnits,
            unitsUsedByOthers,
            maxUnitsUsed: numberOfUnits + unitsUsedByOthers,
            status: row.status as EquipmentConflictStatus,
            overlappingBookings: toEquipmentUsageBookings(usageRowsBySubject.get(toNumber(row.subject_id)) ?? []),
        };
    });
};

// The bookings using the equipment during the period (both ends inclusive), and the most units they use at the same
// time. Cancelled bookings are not counted.
export const fetchEquipmentUsage = async (equipmentId: number, from: Date, to: Date): Promise<EquipmentUsage> => {
    const rows = await runQuery(equipmentUsageQuery(), {
        equipmentId,
        from: from.toISOString(),
        to: to.toISOString(),
    });

    return {
        maxUnitsUsed: rows.length > 0 ? toNumber(rows[0].max_units) : 0,
        bookings: toEquipmentUsageBookings(rows),
    };
};

// The most units of the equipment each booking uses at the same time, over all its lists, by booking id. Includes
// cancelled bookings.
export const fetchEquipmentUnitsPerBooking = async (equipmentId: number): Promise<Map<number, number>> => {
    const rows = await runQuery(equipmentUsagePerBookingQuery(), {
        equipmentId,
        from: null,
        to: null,
        includeCancelled: 1,
    });
    return new Map(rows.map((row) => [toNumber(row.booking_id), toNumber(row.units)]));
};
