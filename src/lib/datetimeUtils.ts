import { Booking, BookingViewModel } from '../models/interfaces';
import { EquipmentList } from '../models/interfaces/EquipmentList';

// Date/Time formatters
//
const datetimeFormatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

const dateFormatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'numeric',
    day: 'numeric',
};

const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
};

const datetimeFormFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

export const formatDatetime = (date: Date | null | undefined, defaultValue = '-'): string =>
    date ? date.toLocaleString('sv-SE', datetimeFormatOptions) : defaultValue;

export const formatDate = (date: Date | null | undefined, defaultValue = '-'): string =>
    date ? date.toLocaleString('sv-SE', dateFormatOptions) : defaultValue;

export const formatTime = (date: Date | null | undefined, defaultValue = '-'): string =>
    date ? date.toLocaleTimeString('sv-SE', timeFormatOptions) : defaultValue;

export const formatDatetimeForForm = (date: Date | null | undefined, defaultValue = '-'): string =>
    date ? date.toLocaleString('sv-SE', datetimeFormFormatOptions) : defaultValue;

// Check if value is a valid date
//
export const validDate = (date: Date | undefined | null): date is Date =>
    !!date && date instanceof Date && !isNaN(date.getTime());

// Convert strings to date
//
export const toDatetimeOrUndefined = (datetimeString: string | null | undefined): Date | undefined => {
    if (!datetimeString) {
        return undefined;
    }

    const datetime = new Date(datetimeString);

    if (isNaN(datetime.getTime())) {
        return undefined;
    }

    return datetime;
};

// Equipment lists
//
export const getNumberOfDays = (equipmentList: EquipmentList): number => {
    if (equipmentList.numberOfDays !== null && equipmentList.numberOfDays !== undefined) {
        return equipmentList.numberOfDays;
    }

    if (!equipmentList.usageStartDatetime || !equipmentList.usageEndDatetime) {
        return 1;
    }

    return Math.ceil(
        (equipmentList.usageEndDatetime.getTime() - equipmentList.usageStartDatetime.getTime()) / (1000 * 3600 * 24),
    );
};

export const getNumberOfEquipmentOutDays = (equipmentList: EquipmentList): number | null => {
    if (equipmentList.numberOfDays !== null && equipmentList.numberOfDays !== undefined) {
        return equipmentList.numberOfDays;
    }

    const equipmentInDatetime = getEquipmentInDatetime(equipmentList);
    const equipmentOutDatetime = getEquipmentOutDatetime(equipmentList);

    if (!equipmentOutDatetime || !equipmentInDatetime) {
        return null;
    }

    return Math.ceil((equipmentInDatetime.getTime() - equipmentOutDatetime.getTime()) / (1000 * 3600 * 24));
};

export const getEquipmentOutDatetime = (equipmentList?: HasDatetimes): Date | null | undefined => {
    if (!equipmentList) {
        return undefined;
    }

    if (!equipmentList.equipmentOutDatetime) {
        return equipmentList.usageStartDatetime;
    }

    return equipmentList.equipmentOutDatetime;
};

export const getEquipmentInDatetime = (equipmentList: HasDatetimes): Date | null | undefined => {
    if (!equipmentList) {
        return undefined;
    }

    if (!equipmentList.equipmentInDatetime) {
        return equipmentList.usageEndDatetime;
    }

    return equipmentList.equipmentInDatetime;
};

// Booking functions
//

// Note: This function will ignore numberOfDays on the lists, since there is no way of determining which lists overlap in times.
export const getNumberOfBookingDays = (booking: Booking): number | null => {
    const { usageStartDatetime, usageEndDatetime } = getBookingDates(booking);

    if (!usageStartDatetime || !usageEndDatetime) {
        return null;
    }

    return Math.ceil((usageEndDatetime.getTime() - usageStartDatetime.getTime()) / (1000 * 3600 * 24));
};

export const getNumberOfEventHours = (booking: Booking): number | null => {
    if (booking.timeReports && booking.timeReports.length > 0) {
        return booking.timeReports.map((x) => x.billableWorkingHours).reduce((a, b) => a + b, 0);
    }

    return booking.timeEstimates?.map((x) => x.numberOfHours).reduce((a, b) => a + b, 0) ?? 0;
};

const getBookingDates = (booking: Booking) => {
    const usageDatetimes = booking.equipmentLists
        ?.flatMap((x) => [x.usageStartDatetime, x.usageEndDatetime])
        .filter(validDate);

    const outDatetimes = booking.equipmentLists
        ?.flatMap((x) => [getEquipmentOutDatetime(x), getEquipmentInDatetime(x)])
        .filter(validDate);

    const minDateReduceFn = (a: Date, b: Date) => (a < b ? a : b);
    const maxDateReduceFn = (a: Date, b: Date) => (a > b ? a : b);

    const usageStartDatetime =
        usageDatetimes && usageDatetimes.length > 0 ? usageDatetimes.reduce(minDateReduceFn) : undefined;
    const usageEndDatetime =
        usageDatetimes && usageDatetimes.length > 0 ? usageDatetimes.reduce(maxDateReduceFn) : undefined;
    const equipmentOutDatetime =
        outDatetimes && outDatetimes.length > 0 ? outDatetimes.reduce(minDateReduceFn) : undefined;
    const equipmentInDatetime =
        outDatetimes && outDatetimes.length > 0 ? outDatetimes.reduce(maxDateReduceFn) : undefined;

    return {
        usageStartDatetime,
        usageEndDatetime,
        equipmentOutDatetime,
        equipmentInDatetime,
    };
};

// Misc helper functions
//
export const addDays = <T extends Date | undefined>(date: T, days: number) => {
    if (!date) {
        return date;
    }
    const dateCopy = new Date(date);
    dateCopy.setDate(dateCopy.getDate() + days);
    return dateCopy;
};

// Display helper functions
//
export const timeIsMidnight = (datetime?: Date | null) =>
    datetime && datetime.getHours() == 0 && datetime.getMinutes() == 0;

export const hasTimeValues = (booking: Booking) =>
    booking.equipmentLists?.some(
        (list) =>
            (!timeIsMidnight(list.usageStartDatetime) && !!list.usageStartDatetime) ||
            (!timeIsMidnight(list.usageEndDatetime) && !!list.usageEndDatetime) ||
            (!timeIsMidnight(list.equipmentOutDatetime) && !!list.equipmentOutDatetime) ||
            (!timeIsMidnight(list.equipmentInDatetime) && !!list.equipmentInDatetime),
    ) ?? false;

// This function converts a datetime to a display string. Since we want the end-time to be inclusive, we need to remove a day when we do not use times.
export const getDisplayEndDatetime = (endDatetime: Date | null | undefined, hasTimeValues: boolean) => {
    if (!endDatetime) {
        return endDatetime;
    }

    if (hasTimeValues) {
        return endDatetime;
    }

    return addDays(endDatetime, -1);
};

const getFormattedInterval = (start: Date | null | undefined, end: Date | null | undefined, hasTimeValues: boolean) => {
    // We want the interval to break in the proper places when it has to span multiple lines, so we change the spaces within dates to nbsp.
    const nonBreakingSpace = '\xa0';

    if (!hasTimeValues) {
        const formattedStartDate = formatDate(start).replaceAll(' ', nonBreakingSpace);
        const formattedEndDate = formatDate(getDisplayEndDatetime(end, hasTimeValues)).replaceAll(
            ' ',
            nonBreakingSpace,
        );

        if (formattedStartDate === formattedEndDate) {
            return formattedStartDate;
        }

        return `${formattedStartDate} - ${formattedEndDate}`;
    }

    if (formatDate(start) === formatDate(end)) {
        return `${formatDate(start).replaceAll(' ', nonBreakingSpace)} ${formatTime(start)} - ${formatTime(end)}`;
    }

    return `${formatDatetime(start).replaceAll(' ', nonBreakingSpace)} - ${formatDatetime(end).replaceAll(
        ' ',
        nonBreakingSpace,
    )}`;
};

const getDateDisplayValues = (entity: HasDatetimes, hasTimeValues: boolean) => {
    return {
        displayEquipmentOutString: hasTimeValues
            ? formatDatetime(getEquipmentOutDatetime(entity))
            : formatDate(getEquipmentOutDatetime(entity)),
        displayEquipmentInString: formatDate(getDisplayEndDatetime(entity.equipmentInDatetime, hasTimeValues)),
        displayUsageStartString: hasTimeValues
            ? formatDatetime(entity.usageStartDatetime)
            : formatDate(entity.usageStartDatetime),
        displayUsageEndString: formatDate(getDisplayEndDatetime(entity.usageEndDatetime, hasTimeValues)),
        displayUsageInterval: getFormattedInterval(entity.usageStartDatetime, entity.usageEndDatetime, hasTimeValues),
        displayEquipmentOutInterval: getFormattedInterval(
            getEquipmentOutDatetime(entity),
            getEquipmentInDatetime(entity),
            hasTimeValues,
        ),
    };
};

export const getBookingDateDisplayValues = (booking: Booking) =>
    getDateDisplayValues(getBookingDates(booking), hasTimeValues(booking));
export const getEquipmentListDateDisplayValues = (equipmentList: EquipmentList, booking: Booking) =>
    getDateDisplayValues(equipmentList, hasTimeValues(booking));

export const toBookingViewModel = (booking: Booking): BookingViewModel => {
    return {
        ...booking,
        ...getBookingDates(booking),
        ...getBookingDateDisplayValues(booking),
    };
};

export interface HasDatetimes {
    equipmentOutDatetime?: Date | null;
    equipmentInDatetime?: Date | null;
    usageStartDatetime?: Date | null;
    usageEndDatetime?: Date | null;
}
