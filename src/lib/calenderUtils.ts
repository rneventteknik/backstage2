import { fetchUserIdByNameTag } from "./db-access/user";
import { notEmpty } from "./utils";

export const getNameTagsFromEventName = (name: string): string[] => {
    // Get part of string within [] brackets
    const match = name.match(/\[(.*?)\]/);
    if (match) {
        return match[1]
            .split(',')
            .map((x) => (x.includes(':') ? x.split(':')[1] : x))
            .map((x) => x.trim());
    }
    return [];
};

export const getUsersIdsFromEventName = async (name: string): Promise<number[]> => {
    const nameTags = getNameTagsFromEventName(name ?? '');
    const users = await Promise.all(nameTags.map(fetchUserIdByNameTag));

    return users.map(x => x?.id).filter(notEmpty);
};