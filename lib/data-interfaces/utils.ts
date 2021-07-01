import { BaseApiModel } from '../../interfaces/api-models';

export function withCreatedDate<T extends BaseApiModel>(entity: T): T {
    return { created: new Date().toISOString(), updated: new Date().toISOString(), ...entity };
}

export function withUpdatedDate<T extends BaseApiModel>(entity: T): T {
    return { updated: new Date().toISOString(), ...entity };
}

export function removeIdAndDates<T extends BaseApiModel>(entity: T): T {
    const entityCopy = { ...entity };

    delete entityCopy.id;
    delete entityCopy.created;
    delete entityCopy.updated;

    return entityCopy;
}
