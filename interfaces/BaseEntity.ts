export interface BaseEntityWithName extends BaseEntity {
    name: string;
}

export interface BaseEntity {
    id: number;
    created: Date | string;
    updated: Date | string;
}
