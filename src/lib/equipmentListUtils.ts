import { Language } from '../models/enums/Language';
import { PricePlan } from '../models/enums/PricePlan';
import { EquipmentPrice, Equipment, EquipmentPackage } from '../models/interfaces';
import { EquipmentListEntry, EquipmentListHeading, EquipmentList } from '../models/interfaces/EquipmentList';
import {
    EquipmentListEntryObjectionModel,
    EquipmentListHeadingObjectionModel,
    IEquipmentListEntryObjectionModel,
    IEquipmentListHeadingEntryObjectionModel,
    IEquipmentListObjectionModel,
} from '../models/objection-models/BookingObjectionModel';
import {
    toEquipmentListEntryObjectionModel,
    toEquipmentListHeadingEntryObjectionModel,
    toEquipmentListObjectionModel,
} from './mappers/booking';
import { getResponseContentOrError } from './utils';
import { getNextSortIndex, moveItemUp, moveItemDown, getSortedList } from './sortIndexUtils';
import { ITimeEstimateObjectionModel } from '../models/objection-models';
import { toTimeEstimate } from './mappers/timeEstimate';
import { EquipmentPackageEntry } from '../models/interfaces/EquipmentPackage';

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
    entries: {
        equipment: Equipment;
        numberOfUnits?: number;
        numberOfHours?: number;
        isFree?: boolean;
        isHidden?: boolean;
    }[],
    list: EquipmentList,
    pricePlan: PricePlan,
    language: Language,
    addListEntries: (entries: EquipmentListEntry[], listId: number | undefined, headerId?: number | undefined) => void,
) => {
    let nextId = getNextEquipmentListEntryId(list);
    let nextSortIndex = getNextSortIndex([...list.listEntries, ...list.listHeadings]);

    const entriesToAdd = entries.map((x) => {
        const overrides: Partial<EquipmentListEntry> = {};

        if (x.numberOfUnits !== undefined) {
            overrides.numberOfUnits = x.numberOfUnits;
        }

        if (x.numberOfHours !== undefined) {
            overrides.numberOfHours = x.numberOfHours;
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

    addListEntries(entriesToAdd, list.id);
};

export const addEquipment = (
    equipment: Equipment,
    list: EquipmentList,
    pricePlan: PricePlan,
    language: Language,
    addListEntries: (entries: EquipmentListEntry[], listId: number | undefined, headerId?: number | undefined) => void,
    numberOfUnits?: number,
    numberOfHours?: number,
) => {
    addMultipleEquipment([{ equipment, numberOfUnits, numberOfHours }], list, pricePlan, language, addListEntries);
};

export const addEquipmentPackage = (
    equipmentPackage: EquipmentPackage,
    list: EquipmentList,
    pricePlan: PricePlan,
    language: Language,
    addListHeading: (heading: EquipmentListHeading, listId: number) => void,
    addListEntries: (entries: EquipmentListEntry[], listId: number | undefined, headerId?: number | undefined) => void,
) => {
    if (equipmentPackage.addAsHeading) {
        addHeadingEntry(
            language === Language.SV ? equipmentPackage.name : equipmentPackage.nameEN ?? equipmentPackage.name,
            list,
            pricePlan,
            language,
            addListHeading,
            language === Language.SV ? equipmentPackage.description : equipmentPackage.descriptionEN,
            equipmentPackage.equipmentEntries.filter((x) => x.equipment) as (EquipmentPackageEntry & {
                equipment: Equipment;
            })[],
        );
        return;
    }
    addMultipleEquipment(
        getSortedList(equipmentPackage.equipmentEntries).filter((x) => x.equipment) as (EquipmentPackageEntry & {
            equipment: Equipment;
        })[],
        list,
        pricePlan,
        language,
        addListEntries,
    );
};

export const addHeadingEntry = (
    headingName: string,
    list: EquipmentList,
    pricePlan: PricePlan,
    language: Language,
    addListHeading: (heading: EquipmentListHeading, listId: number) => void,
    headingDescription = '',
    entries: {
        id: number;
        equipment: Equipment;
        numberOfUnits?: number;
        numberOfHours?: number;
        sortIndex: number;
        isFree?: boolean;
        isHidden?: boolean;
    }[] = [],
) => {
    const nextHeadingId = getNextEquipmentListHeadingEntryId(list);
    const nextHeadingSortIndex = getNextSortIndex(list.listEntries);

    let nextId = getNextEquipmentListEntryId(list);
    let nextSortIndex = 10;

    const entriesToAdd = getSortedList(entries).map((x) => {
        const overrides: Partial<EquipmentListEntry> = {};

        if (x.numberOfUnits !== undefined) {
            overrides.numberOfUnits = x.numberOfUnits;
        }

        if (x.numberOfHours !== undefined) {
            overrides.numberOfHours = x.numberOfHours;
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

    addListHeading(entity, list.id);
};

export const importEquipmentEntries = (
    equipmentListEntries: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'>[],
    equipmentListHeadings: {
        name: string;
        description: string;
        listEntries: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'>[];
    }[],
    list: EquipmentList,
    addListEntriesAndHeadings: (
        entries: EquipmentListEntry[],
        headings: EquipmentListHeading[],
        listId: number,
    ) => void,
) => {
    let nextEntryId = getNextEquipmentListEntryId(list);
    let nextHeadingId = getNextEquipmentListHeadingEntryId(list);
    let nextSortIndex = getNextSortIndex(getEntitiesToDisplay(list));

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
    const equipmentListHeadingsToImport: EquipmentListHeading[] = equipmentListHeadings.map(mapHeading);

    addListEntriesAndHeadings(equipmentListEntriesToImport, equipmentListHeadingsToImport, list.id);
};

// Helper functions to update, delete and move list entries and headings
//
export const saveSortIndexOfViewModels = (
    updatedEntities: EquipmentListEntityViewModel[],
    saveListEntriesAndHeadings: (
        entries: Partial<EquipmentListEntry>[],
        headings: Partial<EquipmentListHeading>[],
    ) => void,
) => {
    saveListEntriesAndHeadings(
        updatedEntities
            .filter((x) => viewModelIsEntity(x))
            .map((x) => getEquipmentListEntryFromViewModel(x))
            .map((x) => ({ id: x.id, sortIndex: x.sortIndex })),
        updatedEntities
            .filter((x) => viewModelIsHeading(x))
            .map((x) => getEquipmentListHeadingFromViewModel(x))
            .map((x) => ({ id: x.id, sortIndex: x.sortIndex })),
    );
};

export const moveListEntryUp = (
    viewModel: EquipmentListEntityViewModel,
    list: EquipmentList,
    saveListEntriesAndHeadings: (
        entries: Partial<EquipmentListEntry>[],
        headings: Partial<EquipmentListHeading>[],
    ) => void,
) => {
    // Move view models in list
    const movedItems = moveItemUp(getPeersOfViewModel(viewModel, list), viewModel);

    // Set sortindex of inner object as well
    movedItems.forEach((x) => (x.entity = { ...x.entity, sortIndex: x.sortIndex }));

    // Save view models
    saveSortIndexOfViewModels(movedItems, saveListEntriesAndHeadings);
};

export const moveListEntryDown = (
    viewModel: EquipmentListEntityViewModel,
    list: EquipmentList,
    saveListEntriesAndHeadings: (
        entries: Partial<EquipmentListEntry>[],
        headings: Partial<EquipmentListHeading>[],
    ) => void,
) => {
    // Move view models in list
    const movedItems = moveItemDown(getPeersOfViewModel(viewModel, list), viewModel);

    // Set sortindex of inner object as well
    movedItems.forEach((x) => (x.entity = { ...x.entity, sortIndex: x.sortIndex }));

    // Save view models
    saveSortIndexOfViewModels(movedItems, saveListEntriesAndHeadings);
};

export const moveListEntryIntoHeading = (
    listEntry: EquipmentListEntry,
    listHeadingEntryId: number | null,
    list: EquipmentList,
    saveListEntry: (
        updatedListEntry: EquipmentListEntry,
        objectionModelOverrides: Partial<EquipmentListEntryObjectionModel>,
    ) => void,
) => {
    // Special case: move out of heading into equipment list
    if (!listHeadingEntryId) {
        saveListEntry(listEntry, {
            equipmentListId: list.id,
            equipmentListHeadingId: null,
            sortIndex: getNextSortIndex(list.listEntries),
        });
        return;
    }

    const listHeadingEntryToUpdate = list.listHeadings.find((x) => x.id === listHeadingEntryId);

    if (!listHeadingEntryToUpdate) {
        throw new Error('Invalid List Heading Entry');
    }

    saveListEntry(listEntry, {
        equipmentListId: null,
        equipmentListHeadingId: listHeadingEntryToUpdate.id,
        sortIndex: getNextSortIndex(listHeadingEntryToUpdate.listEntries),
    });
};

export const toggleHideListEntry = (
    entry: EquipmentListEntry,
    saveListEntry: (updatedListEntry: EquipmentListEntry) => void,
) => {
    saveListEntry({ ...entry, isHidden: !entry.isHidden });
};

export const getDefaultEquipmentListName = (language: Language) =>
    language === Language.EN ? 'Equipment' : 'Utrustning';

// Functions to call the API
//

export const saveListApiCall = async (updatedList: EquipmentList, bookingId: number) => {
    const body = { equipmentList: toEquipmentListObjectionModel(updatedList, bookingId) };

    const request = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };

    return fetch('/api/bookings/' + bookingId + '/equipmentLists/' + updatedList.id, request).then((apiResponse) =>
        getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse),
    );
};

export const saveListEntryApiCall = async (
    entry: Partial<EquipmentListEntry>,
    bookingId: number,
    objectionModelOverrides: Partial<EquipmentListEntryObjectionModel> = {},
) => {
    const body = {
        equipmentListEntry: { ...toEquipmentListEntryObjectionModel(entry), ...objectionModelOverrides },
    };

    const request = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };

    return fetch('/api/bookings/' + bookingId + '/equipmentListEntry/' + entry.id, request).then((apiResponse) =>
        getResponseContentOrError<IEquipmentListEntryObjectionModel>(apiResponse),
    );
};

export const saveListHeadingApiCall = async (
    heading: Partial<EquipmentListHeading>,
    bookingId: number,
    objectionModelOverrides: Partial<EquipmentListHeadingObjectionModel> = {},
) => {
    const body = {
        equipmentListHeading: { ...toEquipmentListHeadingEntryObjectionModel(heading), ...objectionModelOverrides },
    };

    const request = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };

    return fetch('/api/bookings/' + bookingId + '/equipmentListHeading/' + heading.id, request).then((apiResponse) =>
        getResponseContentOrError<IEquipmentListHeadingEntryObjectionModel>(apiResponse),
    );
};

export const deleteListEntryApiCall = async (entry: EquipmentListEntry, bookingId: number) => {
    const request = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    };

    return fetch('/api/bookings/' + bookingId + '/equipmentListEntry/' + entry.id, request).then((apiResponse) =>
        getResponseContentOrError(apiResponse),
    );
};

export const deleteListHeadingApiCall = async (heading: EquipmentListHeading, bookingId: number) => {
    const request = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    };

    return fetch('/api/bookings/' + bookingId + '/equipmentListHeading/' + heading.id, request).then((apiResponse) =>
        getResponseContentOrError(apiResponse),
    );
};

export const addListEntryApiCall = async (
    entry: EquipmentListEntry,
    bookingId: number,
    listId: number | undefined,
    headerId?: number | undefined,
) => {
    const body = {
        equipmentListEntry: toEquipmentListEntryObjectionModel(entry),
    };

    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };

    return fetch(
        `/api/bookings/${bookingId}/equipmentListEntry?equipmentListId=${listId}&equipmentListHeadingId=${headerId}`,
        request,
    ).then((apiResponse) => getResponseContentOrError(apiResponse));
};

export const addListHeadingApiCall = async (heading: EquipmentListHeading, bookingId: number, listId: number) => {
    const body = {
        equipmentListHeading: toEquipmentListHeadingEntryObjectionModel(heading),
    };

    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };

    return fetch(`/api/bookings/${bookingId}/equipmentListHeading?equipmentListId=${listId}`, request).then(
        (apiResponse) => getResponseContentOrError(apiResponse),
    );
};

export const addTimeEstimateApiCall = async (timeEstimate: ITimeEstimateObjectionModel, bookingId: number) => {
    const body = { timeEstimate: timeEstimate };

    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };

    return fetch(`/api/bookings/${bookingId}/timeEstimate`, request)
        .then((apiResponse) => getResponseContentOrError<ITimeEstimateObjectionModel>(apiResponse))
        .then(toTimeEstimate);
};
