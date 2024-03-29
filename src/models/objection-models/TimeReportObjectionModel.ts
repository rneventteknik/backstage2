/* eslint-disable @typescript-eslint/no-empty-interface */

import { Model, RelationMappingsThunk } from 'objection';
import { BaseObjectionModelWithName } from '.';
import { IUserObjectionModel, UserObjectionModel } from './UserObjectionModel';

export interface ITimeReportObjectionModel extends BaseObjectionModelWithName {
    userId: number;
    bookingId: number;
    user?: IUserObjectionModel;
    actualWorkingHours: number;
    billableWorkingHours: number;
    startDatetime?: string;
    endDatetime?: string;
    pricePerHour: number;
    sortIndex: number;
}

export class TimeReportObjectionModel extends Model implements ITimeReportObjectionModel {
    static tableName = 'TimeReport';

    static relationMappings: RelationMappingsThunk = () => ({
        user: {
            relation: Model.HasOneRelation,
            modelClass: UserObjectionModel,
            filter: (query) =>
                query.select(
                    'id',
                    'name',
                    'created',
                    'updated',
                    'memberStatus',
                    'nameTag',
                    'phoneNumber',
                    'slackId',
                    'emailAddress',
                ),
            join: {
                from: 'User.id',
                to: 'TimeReport.userId',
            },
        },
    });

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    bookingId!: number;
    userId!: number;
    user!: IUserObjectionModel;
    actualWorkingHours!: number;
    billableWorkingHours!: number;
    endDatetime!: string;
    startDatetime!: string;
    pricePerHour!: number;
    sortIndex!: number;
}
