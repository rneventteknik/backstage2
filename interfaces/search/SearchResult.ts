import { BaseApiModelWithName } from '../api-models';
import { IEventApiModel, IUserApiModel } from '../api-models/';

export interface SearchResult {
    events: IEventApiModel[];
    equipment: BaseApiModelWithName[];
    users: IUserApiModel[];
}
