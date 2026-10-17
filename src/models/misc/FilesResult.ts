export interface FilesResult {
    id: string;
    name?: string;
    mimeType?: string;
    link?: string;
    modifiedTime?: string;
    shortcutDetails?: ShortcutDetails; // Only present for folder shortcuts and file shortcuts
}

export interface ShortcutDetails {
    targetId: string;
    targetMimeType?: string;
    targetResourceKey?: string;
}
