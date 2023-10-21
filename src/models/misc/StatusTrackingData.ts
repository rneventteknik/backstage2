export interface StatusTrackingStatus {
    key: string;
    label: string;
    value: string;
    updated: string;
}

export type StatusTrackingData = StatusTrackingStatus[];
