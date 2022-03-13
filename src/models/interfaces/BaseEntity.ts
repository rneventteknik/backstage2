export interface BaseEntityWithName extends BaseEntity {
    name: string;
}

export interface BaseEntity extends HasId {
    created?: Date;
    updated?: Date;
}

export interface HasId {
    id: number;
}
