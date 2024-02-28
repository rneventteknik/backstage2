import currency from 'currency.js';

export interface BaseEntityWithName extends BaseEntity {
    name: string;
}

export interface BaseEntity extends HasId {
    created?: Date;
    updated?: Date;
}

export interface HasId {
    id: number;
}

export interface HasStringId {
    id: string;
}

export interface PricedEntity {
    pricePerHour: number;
    pricePerUnit: number;
}
export interface PricedEntityWithTHS {
    pricePerHour: number;
    pricePerUnit: number;
    pricePerHourTHS: number;
    pricePerUnitTHS: number;
}

export interface PricedEntityCurrency {
    pricePerHour: currency;
    pricePerUnit: currency;
}
export interface PricedEntityWithTHSCurrency {
    pricePerHour: currency;
    pricePerUnit: currency;
    pricePerHourTHS: currency;
    pricePerUnitTHS: currency;
}
