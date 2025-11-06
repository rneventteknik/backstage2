/* eslint-disable @typescript-eslint/no-empty-interface */

import { Model } from 'objection';
import { BaseObjectionModel } from '.';

export interface IEmailThreadObjectionModel extends BaseObjectionModel {
    bookingId: number,
    threadId: string
}

export class EmailThreadObjectionModel extends Model implements IEmailThreadObjectionModel {
    static tableName = 'EmailThread';

    id!: number;
    created!: string;
    updated!: string;
    bookingId!: number;
    threadId!: string;
}
