import { BaseEntityWithName } from './BaseEntity';

export interface StatusTracking extends BaseEntityWithName {
    value: string;
    key: string;
    lastStatusUpdate: Date | undefined;
}
