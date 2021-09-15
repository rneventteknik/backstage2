import { IEventApiModel, IEquipmentApiModel, IUserApiModel } from '../api-models';

export interface SearchResult {
    events: IEventApiModel[];
    equipment: IEquipmentApiModel[];
    users: IUserApiModel[];
}
