import { BaseApiModelWithName } from '../api-models';
import { IEventApiModel } from '../api-models/EventApiModel';
import { IUserApiModel } from '../api-models/UserApiModel';

export interface SearchResult {
    events: IEventApiModel[];
    equipment: BaseApiModelWithName[];
    users: IUserApiModel[];
}
