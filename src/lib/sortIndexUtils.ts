import { HasId, HasStringId } from '../models/interfaces/BaseEntity';
import { updateItemsInArrayById } from './utils';

export interface HasSortIndex {
    sortIndex: number;
}

type Sortable = HasSortIndex & (HasId | HasStringId);

export const sortIndexSortFn = (a: Sortable, b: Sortable) => {
    if ((a.sortIndex ?? 0) < (b.sortIndex ?? 0)) {
        return -1;
    }
    if ((a.sortIndex ?? 0) > (b.sortIndex ?? 0)) {
        return 1;
    }

    // Use id for sorting as a fallback
    if (a.id < b.id) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }

    return 0;
};

export const getSortedList = <T extends Sortable>(list: T[]) => [...list].sort(sortIndexSortFn);

export const getPreviousItem = <T extends Sortable>(list: T[], item: T): T | null => {
    const sortedList = getSortedList(list);

    const index = sortedList.findIndex((x) => x.id === item.id);

    if (index === -1 || index === 0) {
        return null;
    }

    return sortedList[index - 1];
};

export const getNextItem = <T extends Sortable>(list: T[], item: T): T | null => {
    const sortedList = getSortedList(list);

    const index = sortedList.findIndex((x) => x.id === item.id);

    if (index === -1 || index === sortedList.length - 1) {
        return null;
    }

    return sortedList[index + 1];
};

export const isFirst = <T extends Sortable>(list: T[], item: T): boolean => getPreviousItem(list, item) === null;

export const isLast = <T extends Sortable>(list: T[], item: T): boolean => getNextItem(list, item) === null;

// Note: This function only returns the modified items, not the whole list
export const moveItemUp = <T extends Sortable>(list: T[], item: T): T[] => {
    if (!list || !item || !list.some((x) => x.id === item.id)) {
        throw new Error('Invalid parameters');
    }

    // This is a (probably) temporary measure to ensure lists which were created before the sortindexes get values and can be sorted
    if (!checkSortIndexUniqueness(list)) {
        const newList = fixSortIndexUniqueness(list);
        const newItem = newList.find((x) => x.id === item.id) ?? item;
        return updateItemsInArrayById(newList, ...moveItemUp(newList, newItem));
    }

    const previous = getPreviousItem(list, item);

    if (!previous) {
        return list;
    }

    return [
        { ...item, sortIndex: previous.sortIndex },
        { ...previous, sortIndex: item.sortIndex },
    ];
};

// Note: This function only returns the modified items, not the whole list
export const moveItemDown = <T extends Sortable>(list: T[], item: T): T[] => {
    if (!list || !item || !list.some((x) => x.id === item.id)) {
        throw new Error('Invalid parameters');
    }

    // This is a (probably) temporary measure to ensure lists which were created before the sortindexes get values and can be sorted
    if (!checkSortIndexUniqueness(list)) {
        const newList = fixSortIndexUniqueness(list);
        const newItem = newList.find((x) => x.id === item.id) ?? item;
        return updateItemsInArrayById(newList, ...moveItemDown(newList, newItem));
    }

    const next = getNextItem(list, item);

    if (!next) {
        return list;
    }

    return [
        { ...item, sortIndex: next.sortIndex },
        { ...next, sortIndex: item.sortIndex },
    ];
};

export const getNextSortIndex = <T extends Sortable>(list: T[]): number => {
    if (!list) {
        throw new Error('Invalid list');
    }

    if (list.length === 0) {
        return 10;
    }

    return (getSortedList(list)[list.length - 1].sortIndex ?? 0) + 10;
};

export const checkSortIndexUniqueness = <T extends Sortable>(list: T[]): boolean =>
    !list.some((entity) => list.some((x) => x.sortIndex === entity.sortIndex && x.id !== entity.id));

export const fixSortIndexUniqueness = <T extends Sortable>(list: T[]): T[] => {
    let sortIndex = 0;
    return getSortedList(list).map((x) => ({ ...x, sortIndex: (sortIndex += 10) }));
};
