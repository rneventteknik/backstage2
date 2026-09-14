export { BookingObjectionModel } from './BookingObjectionModel';
export { UserObjectionModel, UserAuthObjectionModel } from './UserObjectionModel';
export { UserCardObjectionModel } from './UserCardObjectionModel';
export {
    EquipmentObjectionModel,
    EquipmentTagObjectionModel,
    EquipmentChangelogEntryObjectionModel,
    EquipmentPriceObjectionModel,
} from './EquipmentObjectionModel';
export { EquipmentPackageObjectionModel, EquipmentPackageEntryObjectionModel } from './EquipmentPackageObjectionModel';

export { TimeEstimateObjectionModel } from './TimeEstimateObjectionModel';

export type { IBookingObjectionModel } from './BookingObjectionModel';
export type { IUserObjectionModel, IUserAuthObjectionModel } from './UserObjectionModel';
export type { IUserCardObjectionModel } from './UserCardObjectionModel';
export type {
    IEquipmentObjectionModel,
    IEquipmentTagObjectionModel,
    IEquipmentChangelogEntryObjectionModel,
    IEquipmentPriceObjectionModel,
} from './EquipmentObjectionModel';

export type { ITimeEstimateObjectionModel } from './TimeEstimateObjectionModel';

export type { ITimeReportObjectionModel } from './TimeReportObjectionModel';

export type {
    IEquipmentPackageObjectionModel,
    IEquipmentPackageEntryObjectionModel,
} from './EquipmentPackageObjectionModel';

export interface BaseObjectionModelWithName extends BaseObjectionModel {
    name: string;
}

export interface BaseObjectionModel {
    id?: number;
    created?: string;
    updated?: string;
}
