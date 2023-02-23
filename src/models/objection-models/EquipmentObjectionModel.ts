/* eslint-disable @typescript-eslint/no-empty-interface */
import { Model, RelationMappingsThunk } from 'objection';
import { BaseObjectionModelWithName } from '.';

export interface IEquipmentObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created?: string;
    updated?: string;
    inventoryCount: number | null;
    nameEN: string;
    description: string;
    descriptionEN: string;
    searchKeywords: string;
    note: string;
    image: unknown; // TODO Add images
    publiclyHidden: boolean;
    isArchived: boolean;
    equipmentPublicCategoryId?: number | null;
    equipmentPublicCategory?: IEquipmentPublicCategoryObjectionModel;
    equipmentLocationId?: number | null;
    equipmentLocation?: IEquipmentLocationObjectionModel;
    tags?: IEquipmentTagObjectionModel[];
    prices?: IEquipmentPriceObjectionModel[];
    changelog?: IEquipmentChangelogEntryObjectionModel[];
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
        changelog: {
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
        equipmentLocation: {
            relation: Model.HasOneRelation,
            modelClass: EquipmentLocationObjectionModel,
            join: {
                from: 'Equipment.equipmentLocationId',
                to: 'EquipmentLocation.id',
            },
        },
    });

    id!: number;
    name!: string;
    created?: string;
    updated?: string;
    inventoryCount!: number;
    nameEN!: string;
    description!: string;
    descriptionEN!: string;
    searchKeywords!: string;
    note!: string;
    image!: unknown; // TODO Add images
    publiclyHidden!: boolean;
    isArchived!: boolean;

    equipmentPublicCategoryId?: number;
    equipmentPublicCategory?: EquipmentPublicCategoryObjectionModel;

    tags?: EquipmentTagObjectionModel[];
    prices?: EquipmentPriceObjectionModel[];
    changelog?: EquipmentChangelogEntryObjectionModel[];
}

export interface IEquipmentTagObjectionModel extends BaseObjectionModelWithName {
    color?: string;
    equipment?: IEquipmentObjectionModel[];
}

export class EquipmentTagObjectionModel extends Model implements IEquipmentTagObjectionModel {
    static tableName = 'EquipmentTag';

    static relationMappings: RelationMappingsThunk = () => ({
        equipment: {
            relation: Model.ManyToManyRelation,
            modelClass: EquipmentObjectionModel,
            join: {
                from: 'EquipmentTag.id',
                through: {
                    from: 'EquipmentTagEquipment.equipmentTagId',
                    to: 'EquipmentTagEquipment.equipmentId',
                },
                to: 'Equipment.id',
            },
        },
    });

    id!: number;
    name!: string;
    created?: string;
    updated?: string;

    color?: string;
    equipment?: EquipmentObjectionModel[];
}

export interface IEquipmentPriceObjectionModel extends BaseObjectionModelWithName {
    pricePerUnit: number;
    pricePerHour: number;
    pricePerUnitTHS: number;
    pricePerHourTHS: number;
}

export class EquipmentPriceObjectionModel extends Model implements IEquipmentPriceObjectionModel {
    static tableName = 'EquipmentPrice';

    id!: number;
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
    sortIndex: number;
}

export class EquipmentPublicCategoryObjectionModel extends Model implements IEquipmentPublicCategoryObjectionModel {
    static tableName = 'EquipmentPublicCategory';

    id!: number;
    name!: string;
    created?: string;
    updated?: string;

    description?: string;
    sortIndex!: number;
}
export interface IEquipmentLocationObjectionModel extends BaseObjectionModelWithName {
    description?: string;
    sortIndex: number;
}

export class EquipmentLocationObjectionModel extends Model implements IEquipmentPublicCategoryObjectionModel {
    static tableName = 'EquipmentLocation';

    id!: number;
    name!: string;
    created?: string;
    updated?: string;

    description?: string;
    sortIndex!: number;
}

export interface IEquipmentChangelogEntryObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created: string;
    updated: string;
    equipmentId: number;
}

export class EquipmentChangelogEntryObjectionModel extends Model implements IEquipmentChangelogEntryObjectionModel {
    static tableName = 'EquipmentChangelogEntry';

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    equipmentId!: number;
}
