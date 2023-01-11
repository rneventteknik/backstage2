import { Booking, TimeEstimate, TimeReport } from '../models/interfaces';
import { PricedEntity, PricedEntityWithTHS } from '../models/interfaces/BaseEntity';
import { EquipmentList, EquipmentListEntry, EquipmentListHeading } from '../models/interfaces/EquipmentList';
import { getNumberOfDays } from './datetimeUtils';

// Calculate total price
//
export const getPrice = (entry: EquipmentListEntry, numberOfDays: number, withDiscount = true): number => {
    if (entry.isHidden) {
        return 0;
    }

    const fullPrice = entry.numberOfUnits * getUnitPrice(entry, numberOfDays);
    return Math.max(0, withDiscount ? fullPrice - entry.discount : fullPrice);
};

export const getUnitPrice = (entry: EquipmentListEntry, numberOfDays: number): number => {
    if (entry.isHidden) {
        return 0;
    }

    return getHourlyPrice(entry) + entry.pricePerUnit + getExtraDaysPrice(entry, numberOfDays);
};

export const getHourlyPrice = (entry: EquipmentListEntry): number => {
    if (entry.isHidden) {
        return 0;
    }

    return entry.numberOfHours * entry.pricePerHour;
};

export const getExtraDaysPrice = (entry: EquipmentListEntry, numberOfTotalDays: number): number => {
    if (entry.isHidden) {
        return 0;
    }

    return entry.pricePerUnit * (numberOfTotalDays - 1) * 0.25;
};

// The database can contain a discount value larger than the linetotal
export const getCalculatedDiscount = (entry: EquipmentListEntry, numberOfDays: number): number => {
    const priceWithoutDiscount = getPrice(entry, numberOfDays, false);
    return Math.min(priceWithoutDiscount, entry.discount);
};

export const getEquipmentListHeadingPrice = (heading: EquipmentListHeading, numberOfDays: number): number => {
    return heading.listEntries.reduce((sum, e) => sum + getPrice(e, numberOfDays), 0);
};

export const getEquipmentListPrice = (list: EquipmentList): number => {
    return (
        list.listEntries.reduce((sum, e) => sum + getPrice(e, getNumberOfDays(list)), 0) +
        list.listHeadings.reduce((sum, h) => sum + getEquipmentListHeadingPrice(h, getNumberOfDays(list)), 0)
    );
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

export const addVAT = (price: number): number => 1.25 * price;

export const addVATToPrice = (price: PricedEntity): PricedEntity => ({
    pricePerHour: addVAT(price.pricePerHour),
    pricePerUnit: addVAT(price.pricePerUnit),
});
export const addVATToPriceWithTHS = (price: PricedEntityWithTHS): PricedEntityWithTHS => ({
    pricePerHour: addVAT(price.pricePerHour),
    pricePerUnit: addVAT(price.pricePerUnit),
    pricePerHourTHS: addVAT(price.pricePerHourTHS),
    pricePerUnitTHS: addVAT(price.pricePerUnitTHS),
});

// Format price
//
export const formatPrice = (price: PricedEntity, hoursUnit = 'h', unitsUnit = 'st'): string => {
    if (price.pricePerHour && !price.pricePerUnit) {
        return `${formatNumberAsCurrency(price.pricePerHour)}/${hoursUnit}`;
    } else if (!price.pricePerHour && price.pricePerUnit) {
        return `${formatNumberAsCurrency(price.pricePerUnit)}/${unitsUnit}`;
    } else {
        return `${formatNumberAsCurrency(price.pricePerUnit)} + ${formatNumberAsCurrency(price.pricePerHour)}/h`;
    }
};

export const formatTHSPrice = (price: PricedEntityWithTHS): string => {
    return formatPrice({ pricePerHour: price.pricePerHourTHS, pricePerUnit: price.pricePerUnitTHS });
};

export const formatNumberAsCurrency = (number: number): string =>
    Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(number);
