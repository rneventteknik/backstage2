import { ResultType, SearchResultViewModel } from '../components/EquipmentSearch';
import { Language } from '../models/enums/Language';
import { PricePlan } from '../models/enums/PricePlan';
import { EquipmentPrice, Equipment } from '../models/interfaces';
import { EquipmentListEntry, EquipmentListHeading, EquipmentList } from '../models/interfaces/EquipmentList';
import { IEquipmentObjectionModel, IEquipmentPackageObjectionModel } from '../models/objection-models';
import { toEquipment } from './mappers/equipment';
import { toEquipmentPackage } from './mappers/equipmentPackage';
import { getNextSortIndex, moveItemUp, moveItemDown } from './sortIndexUtils';
import { getResponseContentOrError, updateItemsInArrayById } from './utils';

// EquipmentListEntityViewModel and helpers
//

export interface EquipmentListEntityViewModel {
    type: 'E' | 'H';
    entity: EquipmentListEntry | EquipmentListHeading;
    id: string;
    sortIndex: number;
    parentId: string | null;
}

const getViewModel = (
    entity: EquipmentListEntry | EquipmentListHeading,
    type: 'E' | 'H',
    parentId: string | null = null,
): EquipmentListEntityViewModel => ({
    type: type,
    entity: entity,
    id: type + entity.id,
    sortIndex: entity.sortIndex,
    parentId,
});

export const viewModelIsHeading = (viewModel: EquipmentListEntityViewModel) => viewModel.type === 'H';
export const viewModelIsEntity = (viewModel: EquipmentListEntityViewModel) => viewModel.type === 'E';

export const getEquipmentListEntryFromViewModel = (viewModel: EquipmentListEntityViewModel) => {
    if (viewModel.type !== 'E') {
        throw new Error('Invalid view model');
    }
    return viewModel.entity as EquipmentListEntry;
};
export const getEquipmentListHeadingFromViewModel = (viewModel: EquipmentListEntityViewModel) => {
    if (viewModel.type !== 'H') {
        throw new Error('Invalid view model');
    }
    return viewModel.entity as EquipmentListHeading;
};

export const getEntitiesToDisplay = (list: EquipmentList) => {
    if (!list) {
        return [];
    }

    return [
        ...list.listEntries.map((x) => getViewModel(x, 'E')),
        ...list.listHeadings.map((x) => getViewModel(x, 'H')),
    ];
};
export const getSubEntitiesToDisplay = (list: EquipmentList) => {
    if (!list) {
        return [];
    }

    return list.listHeadings.map((x) => ({
        parentId: 'H' + x.id,
        entities: x.listEntries.map((e) => getViewModel(e, 'E', 'H' + x.id)),
    }));
};

export const getHeaderOfEntity = (entity: EquipmentListEntry, list: EquipmentList) =>
    list.listHeadings.find((heading) => heading.listEntries.some((x) => x.id === entity.id));

// The peers of the entity is all the items in the same list or under the same heading, including the supplied item.
export const getPeersOfViewModel = (viewModel: EquipmentListEntityViewModel, list: EquipmentList) =>
    viewModel.parentId
        ? getSubEntitiesToDisplay(list).find((x) => x.parentId === viewModel.parentId)?.entities ?? []
        : getEntitiesToDisplay(list);

// Heper functions to get default values
//

export const getEquipmentListEntryPrices = (equipmentPrice: EquipmentPrice, pricePlan: PricePlan) => {
    return {
        pricePerHour:
            (pricePlan === PricePlan.EXTERNAL ? equipmentPrice?.pricePerHour : equipmentPrice?.pricePerHourTHS) ?? 0,
        pricePerUnit:
            (pricePlan === PricePlan.EXTERNAL ? equipmentPrice?.pricePerUnit : equipmentPrice?.pricePerUnitTHS) ?? 0,
        equipmentPrice: equipmentPrice,
    };
};

// Getter to get the default list entry for a given equipment (i.e. initial number of hours, units, price etc)
export const getDefaultListEntryFromEquipment = (
    equipment: Equipment,
    pricePlan: PricePlan,
    language: Language,
    id: number,
    sortIndex: number,
    isFree = false,
    override?: Partial<EquipmentListEntry>,
) => {
    if (!equipment.id) {
        throw new Error('Invalid equipment');
    }

    const prices = isFree
        ? { pricePerHour: 0, pricePerUnit: 0 }
        : getEquipmentListEntryPrices(equipment.prices[0], pricePlan);

    const entry: EquipmentListEntry = {
        id: id,
        sortIndex: sortIndex,
        equipment: equipment,
        equipmentId: equipment.id,
        numberOfUnits: 1,
        numberOfHours: prices.pricePerHour > 0 ? 1 : 0,
        name: language === Language.SV ? equipment.name : equipment.nameEN,
        description: language === Language.SV ? equipment.description : equipment.descriptionEN,
        discount: 0,
        isHidden: false,
        account: null,
        ...prices,
    };

    return { ...entry, ...(override ?? {}) };
};

// Helper functions to add equipment
//

export const getNextEquipmentListEntryId = (list: EquipmentList) =>
    Math.min(
        -1,
        ...(list?.listEntries ?? []).map((x) => x.id),
        ...(list?.listHeadings.flatMap((x) => x.listEntries ?? []) ?? []).map((x) => x.id),
    ) - 1;

const getNextEquipmentListHeadingEntryId = (list: EquipmentList) =>
    Math.min(-1, ...(list?.listHeadings ?? []).map((x) => x.id)) - 1;

const addMultipleEquipment = (
    entries: { equipment: Equipment; numberOfUnits?: number; isFree?: boolean; isHidden?: boolean }[],
    list: EquipmentList,
    pricePlan: PricePlan,
    language: Language,
    saveList: (updatedList: EquipmentList) => void,
) => {
    let nextId = getNextEquipmentListEntryId(list);
    let nextSortIndex = getNextSortIndex([...list.listEntries, ...list.listHeadings]);

    const entriesToAdd = entries.map((x) => {
        const overrides: Partial<EquipmentListEntry> = {};

        if (x.numberOfUnits !== undefined) {
            overrides.numberOfUnits = x.numberOfUnits;
        }

        if (x.isHidden !== undefined) {
            overrides.isHidden = x.isHidden;
        }

        // This id is only used in the client, it is striped before sending to the server
        const entity = getDefaultListEntryFromEquipment(
            x.equipment,
            pricePlan,
            language,
            nextId,
            nextSortIndex,
            x.isFree,
            overrides,
        );

        nextId -= 1;
        nextSortIndex += 10;

        return entity;
    });

    if (list) {
        saveList({ ...list, listEntries: [...list.listEntries, ...entriesToAdd] });
    }
};

const addEquipment = (
    equipment: Equipment,
    list: EquipmentList,
    pricePlan: PricePlan,
    language: Language,
    saveList: (updatedList: EquipmentList) => void,
    numberOfUnits?: number,
) => {
    addMultipleEquipment([{ equipment, numberOfUnits }], list, pricePlan, language, saveList);
};

export const addFromSearch = (
    res: SearchResultViewModel,
    list: EquipmentList,
    pricePlan: PricePlan,
    language: Language,
    saveList: (updatedList: EquipmentList) => void,
) => {
    switch (res.type) {
        case ResultType.EQUIPMENT:
            return fetch('/api/equipment/' + res.id)
                .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
                .then(toEquipment)
                .then((equipment) => {
                    addEquipment(equipment, list, pricePlan, language, saveList);
                });

        case ResultType.EQUIPMENTPACKAGE:
            return fetch('/api/equipmentPackage/' + res.id)
                .then((apiResponse) => getResponseContentOrError<IEquipmentPackageObjectionModel>(apiResponse))
                .then(toEquipmentPackage)
                .then((equipmentPackage) => {
                    if (equipmentPackage.addAsHeading) {
                        addHeadingEntry(
                            language === Language.SV
                                ? equipmentPackage.name
                                : equipmentPackage.nameEN ?? equipmentPackage.name,
                            list,
                            pricePlan,
                            language,
                            saveList,
                            language === Language.SV ? equipmentPackage.description : equipmentPackage.descriptionEN,
                            equipmentPackage.equipmentEntries.filter((x) => x.equipment) as {
                                equipment: Equipment;
                                numberOfUnits?: number;
                                isFree: boolean;
                                isHidden: boolean;
                            }[],
                        );
                        return;
                    }
                    addMultipleEquipment(
                        equipmentPackage.equipmentEntries.filter((x) => x.equipment) as {
                            equipment: Equipment;
                            numberOfUnits?: number;
                            isFree: boolean;
                            isHidden: boolean;
                        }[],
                        list,
                        pricePlan,
                        language,
                        saveList,
                    );
                });
    }
};

export const addHeadingEntry = (
    headingName: string,
    list: EquipmentList,
    pricePlan: PricePlan,
    language: Language,
    saveList: (updatedList: EquipmentList) => void,
    headingDescription = '',
    entries: { equipment: Equipment; numberOfUnits?: number; isFree?: boolean; isHidden?: boolean }[] = [],
) => {
    const nextHeadingId = getNextEquipmentListHeadingEntryId(list);
    const nextHeadingSortIndex = getNextSortIndex(list.listEntries);

    let nextId = getNextEquipmentListEntryId(list);
    let nextSortIndex = 10;

    const entriesToAdd = entries.map((x) => {
        const overrides: Partial<EquipmentListEntry> = {};

        if (x.numberOfUnits !== undefined) {
            overrides.numberOfUnits = x.numberOfUnits;
        }

        if (x.isHidden !== undefined) {
            overrides.isHidden = x.isHidden;
        }

        // This id is only used in the client, it is striped before sending to the server
        const entity = getDefaultListEntryFromEquipment(
            x.equipment,
            pricePlan,
            language,
            nextId,
            nextSortIndex,
            x.isFree,
            overrides,
        );

        nextId -= 1;
        nextSortIndex += 10;

        return entity;
    });

    // This id is only used in the client, it is striped before sending to the server
    const entity: EquipmentListHeading = {
        id: nextHeadingId,
        sortIndex: nextHeadingSortIndex,
        name: headingName,
        description: headingDescription,
        listEntries: entriesToAdd,
    };

    if (list) {
        saveList({ ...list, listHeadings: [...list.listHeadings, entity] });
    }
};

export const importEquipmentEntries = (
    equipmentListEntries: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'>[],
    equipmentListHeadings: {
        name: string;
        description: string;
        listEntries: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'>[];
    }[],
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    let nextEntryId = getNextEquipmentListEntryId(list);
    let nextHeadingId = getNextEquipmentListHeadingEntryId(list);
    let nextSortIndex = getNextSortIndex(list.listEntries);

    const mapEntry = (x: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'>) => {
        const entity: EquipmentListEntry = {
            id: nextEntryId,
            sortIndex: nextSortIndex,

            equipmentId: x.equipmentId,
            equipment: x.equipment,
            equipmentPrice: x.equipmentPrice,
            numberOfUnits: x.numberOfUnits,
            numberOfHours: x.numberOfHours,
            discount: x.discount,

            name: x.name,
            description: x.description,

            pricePerUnit: x.pricePerUnit,
            pricePerHour: x.pricePerHour,
            isHidden: x.isHidden,
            account: x.account,
        };

        nextEntryId -= 1;
        nextSortIndex += 10;

        return entity;
    };

    const mapHeading = (x: {
        name: string;
        description: string;
        listEntries: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'>[];
    }) => {
        const entity: EquipmentListHeading = {
            id: nextHeadingId,
            sortIndex: nextSortIndex,

            name: x.name,
            description: x.description,

            listEntries: x.listEntries.map(mapEntry),
        };

        nextHeadingId -= 1;
        nextSortIndex += 10;

        return entity;
    };

    const equipmentListEntriesToImport: EquipmentListEntry[] = equipmentListEntries.map(mapEntry);
    const equipmentListheadingsToImport: EquipmentListHeading[] = equipmentListHeadings.map(mapHeading);

    saveList({
        ...list,
        listEntries: [...list.listEntries, ...equipmentListEntriesToImport],
        listHeadings: [...list.listHeadings, ...equipmentListheadingsToImport],
    });
};

// Helper functions to update, delete and move list entries and headings
//

export const updateListEntry = (
    listEntry: EquipmentListEntry,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    const newEquipmentListEntries = updateItemsInArrayById(list.listEntries, listEntry);
    const newEquipmentListHeadingEntries = list.listHeadings.map(
        (x): EquipmentListHeading => ({
            ...x,
            listEntries: updateItemsInArrayById(x.listEntries, listEntry),
        }),
    );

    saveList({
        ...list,
        listEntries: newEquipmentListEntries,
        listHeadings: newEquipmentListHeadingEntries,
    });
};

export const deleteListEntry = (
    listEntry: EquipmentListEntry,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    const newEquipmentListEntries = list.listEntries.filter((x) => x.id != listEntry.id);
    const newEquipmentListHeadingEntries = list.listHeadings.map(
        (x): EquipmentListHeading => ({
            ...x,
            listEntries: x.listEntries.filter((x) => x.id != listEntry.id),
        }),
    );

    saveList({
        ...list,
        listEntries: newEquipmentListEntries,
        listHeadings: newEquipmentListHeadingEntries,
    });
};

export const updateListHeadingEntry = (
    listHeaderEntry: EquipmentListHeading,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    const newEquipmentListHeadingEntries = updateItemsInArrayById(list.listHeadings, listHeaderEntry);
    saveList({ ...list, listHeadings: newEquipmentListHeadingEntries });
};

export const deleteListHeadingEntry = (
    listHeaderEntry: EquipmentListHeading,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    const newEquipmentListHeadingEntries = list.listHeadings.filter((x) => x.id != listHeaderEntry.id);
    saveList({ ...list, listHeadings: newEquipmentListHeadingEntries });
};

const saveViewModels = (
    updatedEntities: EquipmentListEntityViewModel[],
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    const newEquipmentListEntries = updateItemsInArrayById(
        list.listEntries,
        ...updatedEntities.filter((x) => viewModelIsEntity(x)).map((x) => getEquipmentListEntryFromViewModel(x)),
    );
    const newEquipmentListHeadingEntries = updateItemsInArrayById(
        list.listHeadings,
        ...updatedEntities.filter((x) => viewModelIsHeading(x)).map((x) => getEquipmentListHeadingFromViewModel(x)),
    );

    saveList({
        ...list,
        listEntries: newEquipmentListEntries,
        listHeadings: newEquipmentListHeadingEntries,
    });
};

export const saveViewModelsOfHeading = (
    updatedEntities: EquipmentListEntityViewModel[],
    headingViewModel: EquipmentListEntityViewModel,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    if (updatedEntities.some((x) => viewModelIsHeading(x))) {
        throw new Error('Headings can only contain entities, not other headings');
    }

    const heading = getEquipmentListHeadingFromViewModel(headingViewModel);

    const newEquipmentListEntries = updateItemsInArrayById(
        heading.listEntries,
        ...updatedEntities.map((x) => getEquipmentListEntryFromViewModel(x)),
    );

    const newHeading = {
        ...heading,
        listEntries: newEquipmentListEntries,
    };

    const newViewModel = getViewModel(newHeading, 'H');

    saveViewModels([newViewModel], list, saveList);
};

export const moveListEntryUp = (
    viewModel: EquipmentListEntityViewModel,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    // Move view models in list
    const movedItems = moveItemUp(getPeersOfViewModel(viewModel, list), viewModel);

    // Set sortindex of inner object as well
    movedItems.forEach((x) => (x.entity = { ...x.entity, sortIndex: x.sortIndex }));

    if (viewModel.parentId) {
        const heading = getEntitiesToDisplay(list).find((x) => x.id === viewModel.parentId);

        if (!heading) {
            throw new Error('Invalid heading');
        }

        saveViewModelsOfHeading(movedItems, heading, list, saveList);
        return;
    }

    // Save view models
    saveViewModels(movedItems, list, saveList);
};

export const moveListEntryDown = (
    viewModel: EquipmentListEntityViewModel,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    // Move view models in list
    const movedItems = moveItemDown(getPeersOfViewModel(viewModel, list), viewModel);

    // Set sortindex of inner object as well
    movedItems.forEach((x) => (x.entity = { ...x.entity, sortIndex: x.sortIndex }));

    if (viewModel.parentId) {
        const heading = getEntitiesToDisplay(list).find((x) => x.id === viewModel.parentId);

        if (!heading) {
            throw new Error('Invalid heading');
        }

        saveViewModelsOfHeading(movedItems, heading, list, saveList);
        return;
    }

    // Save view models
    saveViewModels(movedItems, list, saveList);
};

export const moveListEntryIntoHeading = (
    listEntry: EquipmentListEntry,
    listHeadingEntryId: number | null,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    // Special case: move out of heading into equipment list
    if (!listHeadingEntryId) {
        saveList({
            ...list,
            listEntries: [
                ...list.listEntries,
                {
                    ...listEntry,
                    sortIndex: getNextSortIndex(list.listEntries),
                    equipmentListHeadingId: undefined,
                    equipmentListId: undefined,
                },
            ],
            listHeadings: list.listHeadings.map(
                (heading): EquipmentListHeading => ({
                    ...heading,
                    listEntries: heading.listEntries.filter((x) => x.id !== listEntry.id),
                }),
            ),
        });
        return;
    }

    const listHeadingEntryToUpdate = list.listHeadings.find((x) => x.id === listHeadingEntryId);

    if (!listHeadingEntryToUpdate) {
        throw new Error('Invalid List Heading Entry');
    }

    const updatedListHeadingEntry: EquipmentListHeading = {
        ...listHeadingEntryToUpdate,
        listEntries: [
            ...listHeadingEntryToUpdate.listEntries,
            {
                ...listEntry,
                sortIndex: getNextSortIndex(listHeadingEntryToUpdate.listEntries),
                equipmentListHeadingId: undefined,
                equipmentListId: undefined,
            },
        ],
    };
    const updatedEquipmentListHeadingEntries = updateItemsInArrayById(list.listHeadings, updatedListHeadingEntry);

    saveList({
        ...list,
        listEntries: list.listEntries.filter((x) => x.id !== listEntry.id),
        listHeadings: updatedEquipmentListHeadingEntries,
    });
};

export const toggleHideListEntry = (
    entry: EquipmentListEntry,
    list: EquipmentList,
    saveList: (updatedList: EquipmentList) => void,
) => {
    updateListEntry({ ...entry, isHidden: !entry.isHidden }, list, saveList);
};
