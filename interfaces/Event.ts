namespace Backstage2.Models {
    export interface Event extends BaseEntity {
        user: User;
        equipmenttLists: EquipmentList[];
        timeEstimates: TimeEstimate[];
        timeReports: TimeReport[];
        changelog: BookingChangelogEntry[];
    }
}