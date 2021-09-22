import { IEventObjectionModel, IEquipmentObjectionModel, IUserObjectionModel } from '../objection-models';

export interface SearchResult {
    events: IEventObjectionModel[];
    equipment: IEquipmentObjectionModel[];
    users: IUserObjectionModel[];
}
