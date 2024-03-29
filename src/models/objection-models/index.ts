export { BookingObjectionModel } from './BookingObjectionModel';
export { UserObjectionModel } from './UserObjectionModel';
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
