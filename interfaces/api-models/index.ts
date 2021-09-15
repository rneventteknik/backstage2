import { IUserApiModel } from './UserApiModel';

export { EventApiModel } from './EventApiModel';
export { UserApiModel } from './UserApiModel';
export {
    EquipmentApiModel,
    EquipmentCategoryApiModel,
    EquipmentChangelogEntryApiModel,
    EquipmentPriceApiModel,
} from './EquipmentApiModel';

export type { IEventApiModel } from './EventApiModel';
export type { IUserApiModel, IUserAuthApiModel } from './UserApiModel';
export type {
    IEquipmentApiModel,
    IEquipmentCategoryApiModel,
    IEquipmentChangelogEntryApiModel,
    IEquipmentPriceApiModel,
} from './EquipmentApiModel';
export interface BaseApiModelWithName extends BaseApiModel {
    name: string;
}

export interface BaseApiModel {
    id?: number;
    created?: string;
    updated?: string;
}

export interface BaseChangeLogApiModel {
    timestamp: string;
    description: string;
    user?: IUserApiModel;
}
