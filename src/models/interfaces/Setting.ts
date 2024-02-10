import { BaseEntity } from './BaseEntity';

export interface Setting extends BaseEntity {
    value: string;
    key: string;
    note: string;
}
