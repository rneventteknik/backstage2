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
    categories?: IEquipmentCategoryObjectionModel[];
    prices?: IEquipmentPriceObjectionModel[];
    changeLog?: IEquipmentChangelogEntryObjectionModel[];
}

export class EquipmentObjectionModel extends Model implements IEquipmentObjectionModel {
    static tableName = 'Equipment';

    static relationMappings: RelationMappingsThunk = () => ({
        categories: {
            relation: Model.ManyToManyRelation,
            modelClass: EquipmentCategoryObjectionModel,
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

    categories?: EquipmentCategoryObjectionModel[];
    prices?: EquipmentPriceObjectionModel[];
    changeLog?: EquipmentChangelogEntryObjectionModel[];
}

export interface IEquipmentCategoryObjectionModel extends BaseObjectionModelWithName {}

export class EquipmentCategoryObjectionModel extends Model implements IEquipmentCategoryObjectionModel {
    static tableName = 'EquipmentCategory';

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
