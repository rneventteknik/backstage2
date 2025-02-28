import { UserObjectionModel } from '../objection-models';

export interface CalendarResult {
    id: string;
    name?: string;
    description?: string;
    location?: string;
    link?: string;
    creator?: string;
    start?: string;
    end?: string;
    existingBookingId?: number;
    workingUsers: UserObjectionModel[];
}
