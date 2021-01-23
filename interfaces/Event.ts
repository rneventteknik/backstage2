namespace Backstage2.Models {
    export interface Event extends BaseEntityWithName {
        ownerUser: User;
        coOwnerUsers: User[];
        equipmenttLists: EquipmentList[];
        timeEstimates: TimeEstimate[];
        timeReports: TimeReport[];
        changelog: EventChangelogEntry[];
        eventType: EventType;
        status: Status;
        invoiceHoogiaId: number;
        invoiceAddress: string;
        invoiceTag: string;
        pricePlan: PricePlan;
        accountKind: AccountKind;
        note: string;
        returnalNote: string;
        location: string;
        contactPersonName: string;
        contactPersonPhone: string;
        contactPersonEmail: string;
    }
}