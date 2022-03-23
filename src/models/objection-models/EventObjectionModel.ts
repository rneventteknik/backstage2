import { Model, RelationMappingsThunk } from 'objection';
import {
    BaseObjectionModelWithName,
    EquipmentObjectionModel,
    IEquipmentObjectionModel,
    EquipmentPriceObjectionModel,
    IEquipmentPriceObjectionModel,
    UserObjectionModel,
    IUserObjectionModel,
} from '.';

export interface IEventObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created: string;
    updated: string;
    equipmentLists: IEquipmentListObjectionModel[];
    ownerUser?: IUserObjectionModel;
    eventType: number;
    status: number;
    salaryStatus: number;
    invoiceHogiaId: number;
    invoiceAddress: string;
    invoiceTag: string;
    invoiceNumber: string;
    note: string;
    returnalNote: string;
    pricePlan: number;
    accountKind: number;
    location: string;
    contactPersonName: string;
    contactPersonPhone: string;
    contactPersonEmail: string;
    calendarEventId: string;
}

export class EventObjectionModel extends Model {
    static tableName = 'Event';

    static relationMappings: RelationMappingsThunk = () => ({
        ownerUser: {
            relation: Model.BelongsToOneRelation,
            modelClass: UserObjectionModel,
            join: {
                from: 'Event.ownerUserId',
                to: 'User.id',
            },
        },
        equipmentLists: {
            relation: Model.HasManyRelation,
            modelClass: EquipmentListObjectionModel,
            join: {
                from: 'Event.id',
                to: 'EquipmentList.eventId',
            },
        },
    });

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    equipmentLists!: EquipmentListObjectionModel[];
    ownerUser!: UserObjectionModel;
    eventType!: number;
    status!: number;
    salaryStatus!: number;
    invoiceHogiaId!: number;
    invoiceAddress!: string;
    invoiceTag!: string;
    invoiceNumber!: string;
    note!: string;
    returnalNote!: string;
    pricePlan!: number;
    accountKind!: number;
    location!: string;
    contactPersonName!: string;
    contactPersonPhone!: string;
    contactPersonEmail!: string;
    calendarEventId!: string;
}

export interface IEquipmentListObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created: string;
    updated: string;
    equipmentListEntries: IEquipmentListEntryObjectionModel[];
    equipmentOutDatetime?: string;
    equipmentInDatetime?: string;
    usageStartDatetime?: string;
    usageEndDatetime?: string;
    eventId: number;
}

export class EquipmentListObjectionModel extends Model {
    static tableName = 'EquipmentList';

    static relationMappings: RelationMappingsThunk = () => ({
        equipmentListEntries: {
            relation: Model.HasManyRelation,
            modelClass: EquipmentListEntryObjectionModel,
            join: {
                from: 'EquipmentList.id',
                to: 'EquipmentListEntry.equipmentListId',
            },
        },
    });

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    equipmentListEntries!: EquipmentListEntryObjectionModel[];
    equipmentOutDatetime?: string;
    equipmentInDatetime?: string;
    usageStartDatetime?: string;
    usageEndDatetime?: string;
    eventId!: number;
}

export interface IEquipmentListEntryObjectionModel extends BaseObjectionModelWithName {
    id?: number;
    created?: string;
    updated?: string;

    equipment: IEquipmentObjectionModel;
    equipmentId: number;
    name: string;
    nameEN: string;
    description: string;
    descriptionEN: string;

    numberOfUnits: number;
    numberOfHours: number;

    pricePerUnit: number;
    pricePerHour: number;
    equipmentPrice: IEquipmentPriceObjectionModel;
    equipmentPriceId: number;
}

export class EquipmentListEntryObjectionModel extends Model {
    static tableName = 'EquipmentListEntry';

    static relationMappings: RelationMappingsThunk = () => ({
        equipmentPrice: {
            relation: Model.HasOneRelation,
            modelClass: EquipmentPriceObjectionModel,
            join: {
                from: 'EquipmentListEntry.equipmentPriceId',
                to: 'EquipmentPrice.id',
            },
        },
        equipment: {
            relation: Model.HasOneRelation,
            modelClass: EquipmentObjectionModel,
            join: {
                from: 'EquipmentListEntry.equipmentId',
                to: 'Equipment.id',
            },
        },
    });

    id!: number;
    name!: string;
    created!: string;
    updated!: string;

    equipment!: EquipmentObjectionModel;
    equipmentId!: number;
    nameEN!: string;
    description!: string;
    descriptionEN!: string;

    numberOfUnits!: number;
    numberOfHours!: number;

    pricePerUnit!: number;
    pricePerHour!: number;
    equipmentPrice!: EquipmentPriceObjectionModel;
    equipmentPriceId!: number;
}
