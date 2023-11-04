/* eslint-disable @typescript-eslint/no-empty-interface */

import { Model } from 'objection';
import { BaseObjectionModelWithName } from '.';

export interface IStatusTrackingObjectionModel extends BaseObjectionModelWithName {
    value: string;
    key: string;
    lastStatusUpdate: string;
}

export class StatusTrackingObjectionModel extends Model implements IStatusTrackingObjectionModel {
    static tableName = 'StatusTracking';

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    lastStatusUpdate!: string;

    key!: string;
    value!: string;
}
