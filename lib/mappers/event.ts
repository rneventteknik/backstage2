import { Event } from '../../interfaces';
import { EventApiModel } from '../../interfaces/api-models/';

// I have disabled the linter here until we implement the mappers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const toEvent = (_apiModel: EventApiModel): Event => {
    throw 'Not implemented';
};
