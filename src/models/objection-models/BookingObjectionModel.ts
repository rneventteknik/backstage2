import { Model, RelationMappingsThunk } from 'objection';
import {
    BaseObjectionModelWithName,
    EquipmentObjectionModel,
    IEquipmentObjectionModel,
    EquipmentPriceObjectionModel,
    IEquipmentPriceObjectionModel,
    UserObjectionModel,
    IUserObjectionModel,
    TimeEstimateObjectionModel,
    ITimeEstimateObjectionModel,
    ITimeReportObjectionModel,
} from '.';
import { Language } from '../enums/Language';
import { TimeReportObjectionModel } from './TimeReportObjectionModel';

export interface IBookingObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created: string;
    updated: string;
    equipmentLists: IEquipmentListObjectionModel[];
    timeEstimates: ITimeEstimateObjectionModel[];
    timeReports: ITimeReportObjectionModel[];
    changelog: IBookingChangelogEntryObjectionModel[];
    ownerUser?: IUserObjectionModel;
    ownerUserId?: number;
    bookingType: number;
    status: number;
    salaryStatus: number;
    paymentStatus: number;
    invoiceHogiaId: number | null;
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
    calendarBookingId: string;
    customerName: string;
    language: Language;
}

export class BookingObjectionModel extends Model {
    static tableName = 'Booking';

    static relationMappings: RelationMappingsThunk = () => ({
        ownerUser: {
            relation: Model.BelongsToOneRelation,
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
                from: 'Booking.ownerUserId',
                to: 'User.id',
            },
        },
        equipmentLists: {
            relation: Model.HasManyRelation,
            modelClass: EquipmentListObjectionModel,
            join: {
                from: 'Booking.id',
                to: 'EquipmentList.bookingId',
            },
        },
        timeEstimates: {
            relation: Model.HasManyRelation,
            modelClass: TimeEstimateObjectionModel,
            join: {
                from: 'Booking.id',
                to: 'TimeEstimate.bookingId',
            },
        },
        timeReports: {
            relation: Model.HasManyRelation,
            modelClass: TimeReportObjectionModel,
            join: {
                from: 'Booking.id',
                to: 'TimeReport.bookingId',
            },
        },
        changelog: {
            relation: Model.HasManyRelation,
            modelClass: BookingChangelogEntryObjectionModel,
            join: {
                from: 'Booking.id',
                to: 'BookingChangelogEntry.bookingId',
            },
        },
    });

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    sortIndex!: number;
    equipmentLists!: EquipmentListObjectionModel[];
    timeEstimates!: TimeEstimateObjectionModel[];
    timeReports!: TimeReportObjectionModel[];
    ownerUser!: UserObjectionModel;
    changelog!: BookingChangelogEntryObjectionModel[];
    bookingType!: number;
    status!: number;
    salaryStatus!: number;
    paymentStatus!: number;
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
    calendarBookingId!: string;
    customerName!: string;
    language!: Language;
}

export interface IEquipmentListObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created: string;
    updated: string;
    sortIndex: number;
    equipmentListEntries: IEquipmentListEntryObjectionModel[];
    equipmentOutDatetime?: string;
    equipmentInDatetime?: string;
    usageStartDatetime?: string;
    usageEndDatetime?: string;
    bookingId: number;
    rentalStatus?: number | null;
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
    sortIndex!: number;
    equipmentListEntries!: EquipmentListEntryObjectionModel[];
    equipmentOutDatetime?: string;
    equipmentInDatetime?: string;
    usageStartDatetime?: string;
    usageEndDatetime?: string;
    bookingId!: number;
    rentalStatus?: number | null;
}

export interface IEquipmentListEntryObjectionModel extends BaseObjectionModelWithName {
    id?: number;
    created?: string;
    updated?: string;

    sortIndex: number;
    equipment?: IEquipmentObjectionModel;
    equipmentId?: number;
    name: string;
    description: string;

    numberOfUnits: number;
    numberOfHours: number;

    pricePerUnit: number;
    pricePerHour: number;
    equipmentPrice?: IEquipmentPriceObjectionModel;
    equipmentPriceId?: number | null;
    discount: number;
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

    sortIndex!: number;
    equipment!: EquipmentObjectionModel;
    equipmentId!: number;
    description!: string;

    numberOfUnits!: number;
    numberOfHours!: number;

    pricePerUnit!: number;
    pricePerHour!: number;
    equipmentPrice!: EquipmentPriceObjectionModel;
    equipmentPriceId!: number;
    discount!: number;
}

export interface IBookingChangelogEntryObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created: string;
    updated: string;
    bookingId: number;
}

export class BookingChangelogEntryObjectionModel extends Model {
    static tableName = 'BookingChangelogEntry';

    id!: number;
    name!: string;
    created!: string;
    updated!: string;
    bookingId!: number;
}
