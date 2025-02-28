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
    initials: string[];
    workingUsersIds: number[];
}
