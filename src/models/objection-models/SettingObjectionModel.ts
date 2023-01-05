/* eslint-disable @typescript-eslint/no-empty-interface */

import { Model } from 'objection';
import { BaseObjectionModel } from '.';

export interface ISettingObjectionModel extends BaseObjectionModel {
    value: string;
    key: string;
    note: string;
}

export class SettingObjectionModel extends Model implements ISettingObjectionModel {
    static tableName = 'Setting';

    key!: string;
    value!: string;
    note!: string;
    created!: string;
    updated!: string;
}
