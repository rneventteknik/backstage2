// Card IDs are the NFC tag UID in hex. 4-byte UIDs are 8 characters and 7-byte UIDs are 14 characters.
// Card readers and users format these differently, so they are normalized before validating or hashing.
// This file is used by both the client and the server, so it must not import any server-only modules.

const validCardIdPattern = /^[0-9A-F]{8,14}$/;

export const normalizeCardId = (cardId: string): string => cardId.replace(/[\s:-]/g, '').toUpperCase();

export const isValidCardId = (cardId: string): boolean => validCardIdPattern.test(normalizeCardId(cardId));
