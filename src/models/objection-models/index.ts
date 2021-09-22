import { IUserObjectionModel } from './UserObjectionModel';

export { EventObjectionModel } from './EventObjectionModel';
export { UserObjectionModel } from './UserObjectionModel';
export {
    EquipmentObjectionModel,
    EquipmentCategoryObjectionModel,
    EquipmentChangelogEntryObjectionModel,
    EquipmentPriceObjectionModel,
} from './EquipmentObjectionModel';

export type { IEventObjectionModel } from './EventObjectionModel';
export type { IUserObjectionModel, IUserAuthObjectionModel } from './UserObjectionModel';
export type {
    IEquipmentObjectionModel,
    IEquipmentCategoryObjectionModel,
    IEquipmentChangelogEntryObjectionModel,
    IEquipmentPriceObjectionModel,
} from './EquipmentObjectionModel';
export interface BaseObjectionModelWithName extends BaseObjectionModel {
    name: string;
}

export interface BaseObjectionModel {
    id?: number;
    created?: string;
    updated?: string;
}

export interface BaseChangeLogObjectionModel {
    timestamp: string;
    description: string;
    user?: IUserObjectionModel;
}
