import { EquipmentPrice } from '../models/interfaces';
import { EquipmentListEntry } from '../models/interfaces/EquipmentList';

// Calculate total price
//
export const getPrice = (entry: EquipmentListEntry): number => {
    const daysMultiplier = 1; // TODO: Add this later when adding intervals to equipment lists
    return entry.numberOfUnits * (entry.numberOfHours * entry.pricePerHour + entry.pricePerUnit * daysMultiplier);
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
