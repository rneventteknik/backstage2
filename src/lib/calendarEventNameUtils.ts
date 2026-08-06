export interface CalendarEventTags {
	tags: string[];
	nameRemaining: string;
}

export const getTagsFromEventName = (name: string): CalendarEventTags => {
	// Get part of string within [] brackets
	const match = name.match(/\[(.*?)\](.+)$/);

	if (match) {
		const tags = match[1]
			.split(/[,/]/)
			.map((x) => (x.includes(':') ? x.split(':')[1] : x))
			.map((x) => x.trim());
		const nameRemaining = match[2].trim();
		return { tags, nameRemaining };
	}

	return { tags: [], nameRemaining: name };
};

export const getNameTagsFromEventName = (name: string): string[] => {
	return getTagsFromEventName(name).tags;
};

export const getEventNameWithoutNameTags = (name: string | undefined): string => {
	return getTagsFromEventName(name ?? '').nameRemaining;
};