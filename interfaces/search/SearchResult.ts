import { EventApiModel, UserApiModel } from '../api-models';
import { BaseEntityWithName } from '../BaseEntity';

export interface SearchResult {
    events: EventApiModel[];
    equipment: BaseEntityWithName[];
    users: UserApiModel[];
}
