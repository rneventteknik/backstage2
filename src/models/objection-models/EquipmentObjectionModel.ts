/* eslint-disable @typescript-eslint/no-empty-interface */
import { Model, RelationMappingsThunk } from 'objection';
import { BaseObjectionModelWithName, BaseChangeLogObjectionModel } from '.';
import { IUserObjectionModel, UserObjectionModel } from './UserObjectionModel';

export interface IEquipmentObjectionModel extends BaseObjectionModelWithName {
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
    equipmentPublicCategoryId?: number;
    equipmentPublicCategory?: IEquipmentPublicCategoryObjectionModel;
    tags?: IEquipmentTagObjectionModel[];
    prices?: IEquipmentPriceObjectionModel[];
    changeLog?: IEquipmentChangelogEntryObjectionModel[];
}

export class EquipmentObjectionModel extends Model implements IEquipmentObjectionModel {
    static tableName = 'Equipment';

    static relationMappings: RelationMappingsThunk = () => ({
        tags: {
            relation: Model.ManyToManyRelation,
            modelClass: EquipmentTagObjectionModel,
            join: {
                from: 'Equipment.id',
                through: {
                    from: 'EquipmentTagEquipment.equipmentId',
                    to: 'EquipmentTagEquipment.equipmentTagId',
                },
                to: 'EquipmentTag.id',
            },
        },
        prices: {
            relation: Model.HasManyRelation,
            modelClass: EquipmentPriceObjectionModel,
            join: {
                from: 'Equipment.id',
                to: 'EquipmentPrice.equipmentId',
            },
        },
        changeLog: {
            relation: Model.HasManyRelation,
            modelClass: EquipmentChangelogEntryObjectionModel,
            join: {
                from: 'Equipment.id',
                to: 'EquipmentChangelogEntry.equipmentId',
            },
        },
        equipmentPublicCategory: {
            relation: Model.HasOneRelation,
            modelClass: EquipmentPublicCategoryObjectionModel,
            join: {
                from: 'Equipment.equipmentPublicCategoryId',
                to: 'EquipmentPublicCategory.id',
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

    equipmentPublicCategoryId?: number;
    equipmentPublicCategory?: EquipmentPublicCategoryObjectionModel;

    tags?: EquipmentTagObjectionModel[];
    prices?: EquipmentPriceObjectionModel[];
    changeLog?: EquipmentChangelogEntryObjectionModel[];
}

export interface IEquipmentTagObjectionModel extends BaseObjectionModelWithName {}

export class EquipmentTagObjectionModel extends Model implements IEquipmentTagObjectionModel {
    static tableName = 'EquipmentTag';

    id?: number;
    name!: string;
    created?: string;
    updated?: string;
}

export interface IEquipmentPriceObjectionModel extends BaseObjectionModelWithName {
    pricePerUnit: number;
    pricePerHour: number;
    pricePerUnitTHS: number;
    pricePerHourTHS: number;
}

export class EquipmentPriceObjectionModel extends Model implements IEquipmentPriceObjectionModel {
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

export interface IEquipmentPublicCategoryObjectionModel extends BaseObjectionModelWithName {
    description?: string;
    sortIndex?: number;
}

export class EquipmentPublicCategoryObjectionModel extends Model implements IEquipmentPublicCategoryObjectionModel {
    static tableName = 'EquipmentPublicCategory';

    id?: number;
    name!: string;
    created?: string;
    updated?: string;

    description?: string;
    sortIndex?: number;
}

export interface IEquipmentChangelogEntryObjectionModel
    extends BaseChangeLogObjectionModel,
        BaseObjectionModelWithName {}

export class EquipmentChangelogEntryObjectionModel extends Model implements IEquipmentChangelogEntryObjectionModel {
    static tableName = 'EquipmentChangelogEntry';

    static relationMappings: RelationMappingsThunk = () => ({
        user: {
            relation: Model.HasOneRelation,
            modelClass: UserObjectionModel,
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

    user?: IUserObjectionModel;
}
