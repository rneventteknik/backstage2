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
    pricePerHour: number | currency;
    pricePerUnit: number | currency;
}
export interface PricedEntityWithTHS {
    pricePerHour: number | currency;
    pricePerUnit: number | currency;
    pricePerHourTHS: number | currency;
    pricePerUnitTHS: number | currency;
}
