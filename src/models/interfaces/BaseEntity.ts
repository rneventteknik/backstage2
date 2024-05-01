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
    pricePerHour: currency;
    pricePerUnit: currency;
}
export interface PricedEntityWithTHS {
    pricePerHour: currency;
    pricePerUnit: currency;
    pricePerHourTHS: currency;
    pricePerUnitTHS: currency;
}
