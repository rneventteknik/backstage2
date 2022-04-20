import { HasId } from '../models/interfaces/BaseEntity';
import { updateItemsInArrayById } from './utils';

export interface HasSortIndex extends HasId {
    sortIndex: number;
}

export function sortIndexSortFn(a: HasSortIndex, b: HasSortIndex) {
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
}

export function getSortedList<T extends HasSortIndex>(list: T[]) {
    return [...list].sort(sortIndexSortFn);
}

export function getPreviousItem<T extends HasSortIndex>(list: T[], item: T): T | null {
    const sortedList = getSortedList(list);

    const index = sortedList.findIndex((x) => x.id === item.id);

    if (index === -1 || index === 0) {
        return null;
    }

    return sortedList[index - 1];
}

export function getNextItem<T extends HasSortIndex>(list: T[], item: T): T | null {
    const sortedList = getSortedList(list);

    const index = sortedList.findIndex((x) => x.id === item.id);

    if (index === -1 || index === sortedList.length - 1) {
        return null;
    }

    return sortedList[index + 1];
}

export function isFirst<T extends HasSortIndex>(list: T[], item: T): boolean {
    return getPreviousItem(list, item) === null;
}

export function isLast<T extends HasSortIndex>(list: T[], item: T): boolean {
    return getNextItem(list, item) === null;
}

// Note: This function only returns the modified items, not the whole list
export function moveItemUp<T extends HasSortIndex>(list: T[], item: T): T[] {
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
}

// Note: This function only returns the modified items, not the whole list
export function moveItemDown<T extends HasSortIndex>(list: T[], item: T): T[] {
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
}

export function getNextSortIndex<T extends HasSortIndex>(list: T[]): number {
    if (!list) {
        throw new Error('Invalid list');
    }

    if (list.length === 0) {
        return 10;
    }

    return (getSortedList(list)[list.length - 1].sortIndex ?? 0) + 10;
}

export function checkSortIndexUniqueness<T extends HasSortIndex>(list: T[]): boolean {
    return !list.some((entity) => list.some((x) => x.sortIndex === entity.sortIndex && x.id !== entity.id));
}

export function fixSortIndexUniqueness<T extends HasSortIndex>(list: T[]): T[] {
    let sortIndex = 0;
    return getSortedList(list).map((x) => ({ ...x, sortIndex: (sortIndex += 10) }));
}
