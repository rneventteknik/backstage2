import { Model, RelationMappingsThunk } from 'objection';
import { BaseObjectionModel, BaseObjectionModelWithName, EquipmentObjectionModel } from '.';
import {
    EquipmentTagObjectionModel,
    IEquipmentTagObjectionModel,
    IEquipmentObjectionModel,
} from './EquipmentObjectionModel';

export interface IEquipmentPackageObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    nameEN?: string;
    description?: string;
    descriptionEN?: string;
    created?: string;
    updated?: string;
    note: string;
    image: unknown; // TODO Add images
    addAsHeading: boolean;
    estimatedHours: number;
    tags?: IEquipmentTagObjectionModel[];
    equipmentEntries?: IEquipmentPackageEntryObjectionModel[];
}

export class EquipmentPackageObjectionModel extends Model implements IEquipmentPackageObjectionModel {
    static tableName = 'EquipmentPackage';

    static relationMappings: RelationMappingsThunk = () => ({
        tags: {
            relation: Model.ManyToManyRelation,
            modelClass: EquipmentTagObjectionModel,
            join: {
                from: 'EquipmentPackage.id',
                through: {
                    from: 'EquipmentTagEquipmentPackage.equipmentPackageId',
                    to: 'EquipmentTagEquipmentPackage.equipmentTagId',
                },
                to: 'EquipmentTag.id',
            },
        },
        equipmentEntries: {
            relation: Model.HasManyRelation,
            modelClass: EquipmentPackageEntryObjectionModel,
            join: {
                from: 'EquipmentPackage.id',
                to: 'EquipmentPackageEntry.equipmentPackageId',
            },
        },
    });

    id!: number;
    name!: string;
    nameEN?: string;
    description?: string;
    descriptionEN?: string;
    created?: string;
    updated?: string;
    note!: string;
    image!: unknown; // TODO Add images
    addAsHeading!: boolean;
    estimatedHours!: number;

    tags?: EquipmentTagObjectionModel[];
    equipmentEntries?: EquipmentPackageEntryObjectionModel[];
}

export interface IEquipmentPackageEntryObjectionModel extends BaseObjectionModel {
    id: number;
    created?: string;
    updated?: string;

    equipmentId: number;

    equipment?: IEquipmentObjectionModel;
    numberOfUnits: number;
    numberOfHours: number;
    sortIndex: number;
    isHidden: boolean;
    isFree: boolean;
}

export class EquipmentPackageEntryObjectionModel extends Model implements IEquipmentPackageEntryObjectionModel {
    static tableName = 'EquipmentPackageEntry';

    static relationMappings: RelationMappingsThunk = () => ({
        equipment: {
            relation: Model.HasOneRelation,
            modelClass: EquipmentObjectionModel,
            join: {
                from: 'EquipmentPackageEntry.equipmentId',
                to: 'Equipment.id',
            },
        },
    });

    id!: number;
    created?: string;
    updated?: string;
    equipmentId!: number;

    equipment?: EquipmentObjectionModel;
    numberOfUnits!: number;
    numberOfHours!: number;
    sortIndex!: number;
    isHidden!: boolean;
    isFree!: boolean;
}
