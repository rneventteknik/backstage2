import { BaseObjectionModel } from '../../models/objection-models';

export const withCreatedDate = <T extends BaseObjectionModel>(entity: T): T => ({
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    ...entity,
});

export const withUpdatedDate = <T extends BaseObjectionModel>(entity: T): T => ({
    updated: new Date().toISOString(),
    ...entity,
});

export const removeIdAndDates = <T extends BaseObjectionModel>(entity: T): T => {
    const entityCopy = { ...entity };

    delete entityCopy.id;
    delete entityCopy.created;
    delete entityCopy.updated;

    return entityCopy;
};

// Compare list content id. The result are from the perspective of turning the target into source.
export const compareLists = <T extends BaseObjectionModel>(
    source?: T[],
    target?: T[],
): { toAdd: T[]; toDelete: T[]; toUpdate: T[] } => {
    const toAdd = (source ?? []).filter((entry) => !target?.map((x) => x.id).includes(entry.id));
    const toDelete = (target ?? []).filter((entry) => !source?.map((x) => x.id).includes(entry.id));
    const toUpdate = (source ?? []).filter((entry) => !toAdd.map((x) => x.id).includes(entry.id));

    return { toAdd, toDelete, toUpdate };
};
