/* eslint-disable @typescript-eslint/no-empty-interface */
import { Model } from 'objection';
import { BaseObjectionModelWithName } from '.';

export interface ITimeEstimateObjectionModel extends BaseObjectionModelWithName {
    id?: number;
    name: string;
    created?: string;
    updated?: string;
    bookingId: number;
    numberOfHours: number;
    pricePerHour: number;
    sortIndex: number;
}

export class TimeEstimateObjectionModel extends Model implements ITimeEstimateObjectionModel {
    static tableName = 'TimeEstimate';

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    bookingId!: number;
    numberOfHours!: number;
    pricePerHour!: number;
    sortIndex!: number;
}
