export interface BaseEntityWithName extends BaseEntity {
    name: string;
}

export interface BaseEntity {
    id: number;
    created?: Date;
    updated?: Date;
}
