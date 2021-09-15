/* eslint-disable @typescript-eslint/no-empty-interface */
import { Model, RelationMappingsThunk } from 'objection';
import { BaseApiModelWithName, BaseChangeLogApiModel } from '.';
import { IUserApiModel, UserApiModel } from './UserApiModel';

export interface IEquipmentApiModel extends BaseApiModelWithName {
    id?: number;
    name: string;
    created?: string;
    updated?: string;
    inventoryCount: number;
    nameEN: string;
    description: string;
    descriptionEN: string;
    note: string;
    image: unknown; // TODO Add images
    publiclyHidden: boolean;
    categories?: IEquipmentCategoryApiModel[];
    prices?: IEquipmentPriceApiModel[];
    changeLog?: IEquipmentChangelogEntryApiModel[];
}

export class EquipmentApiModel extends Model implements IEquipmentApiModel {
    static tableName = 'Equipment';

    static relationMappings: RelationMappingsThunk = () => ({
        categories: {
            relation: Model.ManyToManyRelation,
            modelClass: EquipmentCategoryApiModel,
            join: {
                from: 'Equipment.id',
                through: {
                    from: 'EquipmentCategoryEquipment.equipmentId',
                    to: 'EquipmentCategoryEquipment.equipmentCategoryId',
                },
                to: 'EquipmentCategory.id',
            },
        },
        prices: {
            relation: Model.HasManyRelation,
            modelClass: EquipmentPriceApiModel,
            join: {
                from: 'Equipment.id',
                to: 'EquipmentPrice.equipmentId',
            },
        },
        changeLog: {
            relation: Model.HasManyRelation,
            modelClass: EquipmentChangelogEntryApiModel,
            join: {
                from: 'Equipment.id',
                to: 'EquipmentChangelogEntry.equipmentId',
            },
        },
    });

    id?: number;
    name!: string;
    created?: string;
    updated?: string;
    inventoryCount!: number;
    nameEN!: string;
    description!: string;
    descriptionEN!: string;
    note!: string;
    image!: unknown; // TODO Add images
    publiclyHidden!: boolean;

    categories?: EquipmentCategoryApiModel[];
    prices?: EquipmentPriceApiModel[];
    changeLog?: EquipmentChangelogEntryApiModel[];
}

export interface IEquipmentCategoryApiModel extends BaseApiModelWithName {}

export class EquipmentCategoryApiModel extends Model implements IEquipmentCategoryApiModel {
    static tableName = 'EquipmentCategory';

    id?: number;
    name!: string;
    created?: string;
    updated?: string;
}

export interface IEquipmentPriceApiModel extends BaseApiModelWithName {
    pricePerUnit: number;
    pricePerHour: number;
    pricePerUnitTHS: number;
    pricePerHourTHS: number;
}

export class EquipmentPriceApiModel extends Model implements IEquipmentPriceApiModel {
    static tableName = 'EquipmentPrice';

    id?: number;
    name!: string;
    created?: string;
    updated?: string;

    pricePerUnit!: number;
    pricePerHour!: number;
    pricePerUnitTHS!: number;
    pricePerHourTHS!: number;
}

export interface IEquipmentChangelogEntryApiModel extends BaseChangeLogApiModel, BaseApiModelWithName {}

export class EquipmentChangelogEntryApiModel extends Model implements IEquipmentChangelogEntryApiModel {
    static tableName = 'EquipmentChangelogEntry';

    static relationMappings: RelationMappingsThunk = () => ({
        user: {
            relation: Model.HasOneRelation,
            modelClass: UserApiModel,
            join: {
                from: 'EquipmentChangelogEntry.userId',
                to: 'User.id',
            },
        },
    });

    id?: number;
    name!: string;
    created?: string;
    updated?: string;
    timestamp!: string;
    description!: string;

    user?: IUserApiModel;
}
