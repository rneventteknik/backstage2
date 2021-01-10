namespace Backstage2.Models {
    export interface Event extends BaseEntity {
        responsibleUser: User;
        equipmenttLists: EquipmentList[];
        timeEstimates: TimeEstimate[];
        timeReports: TimeReport[];
        changelog: BookingChangelogEntry[];
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