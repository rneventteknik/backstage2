import { Booking, BookingViewModel } from '../models/interfaces';
import { EquipmentList } from '../models/interfaces/EquipmentList';
import { uppercaseFirstLetter } from './utils';

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

const weekdayFormatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
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

const dateFormFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
};

const monthYearFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
};

export const formatDatetime = (
    date: Date | null | undefined,
    defaultValue = '-',
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
): string => (date ? date.toLocaleString(locale, datetimeFormatOptions) : defaultValue);

export const formatDate = (
    date: Date | null | undefined,
    defaultValue = '-',
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
): string => (date ? date.toLocaleString(locale, dateFormatOptions) : defaultValue);

export const formatWeekDay = (
    date: Date | null | undefined,
    defaultValue = '-',
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
): string => (date ? date.toLocaleString(locale, weekdayFormatOptions) : defaultValue);

export const formatTime = (
    date: Date | null | undefined,
    defaultValue = '-',
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
): string => (date ? date.toLocaleTimeString(locale, timeFormatOptions) : defaultValue);

export const formatDatetimeForForm = (
    date: Date | null | undefined,
    defaultValue = '-',
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
): string => (date ? date.toLocaleString(locale, datetimeFormFormatOptions) : defaultValue);

export const formatDateForForm = (
    date: Date | null | undefined,
    defaultValue = '-',
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
): string => (date ? date.toLocaleString(locale, dateFormFormatOptions) : defaultValue);

export const formatMonthYear = (
    date: Date | null | undefined,
    defaultValue = '-',
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
): string => (date ? uppercaseFirstLetter(date.toLocaleString(locale, monthYearFormatOptions)) : defaultValue);

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

export const addHours = <T extends Date | undefined>(date: T, hours: number) => {
    if (!date) {
        return date;
    }
    const dateCopy = new Date(date);
    dateCopy.setHours(dateCopy.getHours() + hours);
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

const getFormattedInterval = (
    start: Date | null | undefined,
    end: Date | null | undefined,
    hasTimeValues: boolean,
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
) => {
    // We want the interval to break in the proper places when it has to span multiple lines, so we change the spaces within dates to nbsp.
    const nonBreakingSpace = '\xa0';

    if (!hasTimeValues) {
        const formattedStartDate = formatDate(start, '-', locale).replaceAll(' ', nonBreakingSpace);
        const formattedEndDate = formatDate(getDisplayEndDatetime(end, hasTimeValues), '-', locale).replaceAll(
            ' ',
            nonBreakingSpace,
        );

        if (formattedStartDate === formattedEndDate) {
            return formattedStartDate;
        }

        return `${formattedStartDate} - ${formattedEndDate}`;
    }

    if (formatDate(start, '-', locale) === formatDate(end, '-', locale)) {
        return `${formatDate(start, '-', locale).replaceAll(' ', nonBreakingSpace)} ${formatTime(
            start,
            '-',
            locale,
        )} - ${formatTime(end, '-', locale)}`;
    }

    return `${formatDatetime(start, '-', locale).replaceAll(' ', nonBreakingSpace)} - ${formatDatetime(
        end,
        '-',
        locale,
    ).replaceAll(' ', nonBreakingSpace)}`;
};

const getDateDisplayValues = (entity: HasDatetimes, hasTimeValues: boolean, locale: 'sv-SE' | 'en-SE' = 'sv-SE') => {
    return {
        displayEquipmentOutString: hasTimeValues
            ? formatDatetime(getEquipmentOutDatetime(entity), '-', locale)
            : formatDate(getEquipmentOutDatetime(entity), '-', locale),
        displayEquipmentInString: formatDate(
            getDisplayEndDatetime(entity.equipmentInDatetime, hasTimeValues),
            '-',
            locale,
        ),
        displayUsageStartString: hasTimeValues
            ? formatDatetime(entity.usageStartDatetime, '-', locale)
            : formatDate(entity.usageStartDatetime, '-', locale),
        displayUsageEndString: formatDate(getDisplayEndDatetime(entity.usageEndDatetime, hasTimeValues), '-', locale),
        displayUsageInterval: getFormattedInterval(
            entity.usageStartDatetime,
            entity.usageEndDatetime,
            hasTimeValues,
            locale,
        ),
        displayEquipmentOutInterval: getFormattedInterval(
            getEquipmentOutDatetime(entity),
            getEquipmentInDatetime(entity),
            hasTimeValues,
            locale,
        ),
        isoFormattedUsageStartString: formatDatetimeForForm(entity.usageStartDatetime),
        monthYearUsageStartString: formatMonthYear(entity.usageStartDatetime),
    };
};

export const getBookingDateDisplayValues = (booking: Booking, locale: 'sv-SE' | 'en-SE' = 'sv-SE') =>
    getDateDisplayValues(getBookingDates(booking), hasTimeValues(booking), locale);
export const getEquipmentListDateDisplayValues = (
    equipmentList: EquipmentList,
    booking: Booking,
    locale: 'sv-SE' | 'en-SE' = 'sv-SE',
) => getDateDisplayValues(equipmentList, hasTimeValues(booking), locale);

export const toBookingViewModel = (booking: Booking): BookingViewModel => {
    return {
        ...booking,
        ...getBookingDates(booking),
        ...getBookingDateDisplayValues(booking),
    };
};

export const getBookingDateHeadingValue = (booking: BookingViewModel) =>
    booking.usageStartDatetime ? booking.monthYearUsageStartString : 'Saknar datum';

export interface HasDatetimes {
    equipmentOutDatetime?: Date | null;
    equipmentInDatetime?: Date | null;
    usageStartDatetime?: Date | null;
    usageEndDatetime?: Date | null;
}
