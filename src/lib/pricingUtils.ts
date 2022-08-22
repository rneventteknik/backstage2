import { EquipmentPrice, Booking, TimeEstimate, TimeReport } from '../models/interfaces';
import { EquipmentList, EquipmentListEntry } from '../models/interfaces/EquipmentList';
import { getNumberOfDays } from './datetimeUtils';

// Calculate total price
//
export const getPrice = (entry: EquipmentListEntry, numberOfDays: number, withDiscount = true): number => {
    const fullPrice = entry.numberOfUnits * getUnitPrice(entry, numberOfDays);
    return withDiscount ? fullPrice - entry.discount : fullPrice;
};

export const getUnitPrice = (entry: EquipmentListEntry, numberOfDays: number): number => {
    return getHourlyPrice(entry) + entry.pricePerUnit + getExtraDaysPrice(entry, numberOfDays);
};

export const getHourlyPrice = (entry: EquipmentListEntry): number => {
    return entry.numberOfHours * entry.pricePerHour;
};

export const getExtraDaysPrice = (entry: EquipmentListEntry, numberOfTotalDays: number): number => {
    return entry.pricePerUnit * (numberOfTotalDays - 1) * 0.25;
};

export const getEquipmentListPrice = (list: EquipmentList): number => {
    return list.equipmentListEntries.reduce((sum, e) => sum + getPrice(e, getNumberOfDays(list)), 0);
};

export const getTimeEstimatePrice = (timeEstimate: TimeEstimate): number => {
    return (timeEstimate.numberOfHours ?? 0) * (timeEstimate.pricePerHour ?? 0);
};

export const getTotalTimeEstimatesPrice = (timeEstimates: TimeEstimate[] | undefined): number => {
    if (!timeEstimates) {
        return 0;
    }

    return timeEstimates?.reduce((sum, l) => sum + getTimeEstimatePrice(l), 0) ?? 0;
};

export const getTimeReportPrice = (timeReport: TimeReport): number => {
    return (timeReport.billableWorkingHours ?? 0) * (timeReport.pricePerHour ?? 0);
};

export const getTotalTimeReportsPrice = (timeReports: TimeReport[] | undefined): number => {
    if (!timeReports) {
        return 0;
    }

    return timeReports?.reduce((sum, l) => sum + getTimeReportPrice(l), 0) ?? 0;
};

export const getBookingPrice = (booking: Booking, forceEstimatedTime = false): number => {
    const equipmentPrice = booking.equipmentLists?.reduce((sum, l) => sum + getEquipmentListPrice(l), 0) ?? 0;
    const timeEstimatePrice = getTotalTimeEstimatesPrice(booking.timeEstimates);
    const timeReportsPrice = getTotalTimeReportsPrice(booking.timeReports);

    if (!forceEstimatedTime && booking.timeReports && booking.timeReports.length > 0) {
        return equipmentPrice + timeReportsPrice;
    }

    return equipmentPrice + timeEstimatePrice;
};

// Format price
//
export const formatPrice = (price: { pricePerHour: number; pricePerUnit: number }): string => {
    if (price.pricePerHour && !price.pricePerUnit) {
        return `${price.pricePerHour} kr/h`;
    } else if (!price.pricePerHour && price.pricePerUnit) {
        return `${price.pricePerUnit} kr/st`;
    } else {
        return `${price.pricePerUnit} kr + ${price.pricePerHour} kr/h`;
    }
};

export const formatTHSPrice = (price: EquipmentPrice): string => {
    return formatPrice({ pricePerHour: price.pricePerHourTHS, pricePerUnit: price.pricePerUnitTHS });
};

export const formatNumberAsCurrency = (number: number): string =>
    Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(number);
