import { EquipmentPrice, Event } from '../models/interfaces';
import { EquipmentList, EquipmentListEntry } from '../models/interfaces/EquipmentList';

// Calculate total price
//
export const getPrice = (entry: EquipmentListEntry, numberOfDays: number): number => {
    const daysMultiplier = 1 + ((numberOfDays - 1) * 0.25);
    return entry.numberOfUnits * (entry.numberOfHours * entry.pricePerHour + entry.pricePerUnit * daysMultiplier);
};

export const getEquipmentListPrice = (list: EquipmentList): number => {
    return list.equipmentListEntries.reduce((sum, e) => sum + getPrice(e, getNumberOfDays(list)), 0);
};

export const getEventPrice = (event: Event): number => {
    return event.equipmentLists?.reduce((sum, l) => sum + getEquipmentListPrice(l), 0) ?? 0;
};

// Format price
//
export const formatPrice = (price: { pricePerHour: number; pricePerUnit: number }): string => {
    if (price.pricePerHour && !price.pricePerUnit) {
        return `${price.pricePerHour}kr/h`;
    } else if (!price.pricePerHour && price.pricePerUnit) {
        return `${price.pricePerUnit}kr/st`;
    } else {
        return `${price.pricePerUnit}kr + ${price.pricePerHour}kr/h`;
    }
};

export const formatTHSPrice = (price: EquipmentPrice): string => {
    return formatPrice({ pricePerHour: price.pricePerHourTHS, pricePerUnit: price.pricePerUnitTHS });
};

export const formatNumberAsCurrency = (number: number): string =>
    Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(number);

// Number of days

export const getNumberOfDays = (equipmentList: EquipmentList): number => {
    if (!equipmentList.usageStartDatetime || !equipmentList.usageEndDatetime) {
        return 1;
    }

    return Math.ceil((equipmentList.usageEndDatetime.getTime() - equipmentList.usageStartDatetime.getTime()) / (1000 * 3600 * 24))
}

export const getNumberOfEquipmentOutDays = (equipmentList: EquipmentList): number | null => {
    if (!equipmentList.equipmentOutDatetime || !equipmentList.equipmentInDatetime) {
        return null;
    }

    return Math.ceil((equipmentList.equipmentInDatetime.getTime() - equipmentList.equipmentOutDatetime.getTime()) / (1000 * 3600 * 24))
}