export interface EventApiModel {
    Id: number;
    Name: string;
    Created: string;
    Updated: string;
    OwnerUser: {
        Id: number;
        Name: string;
        Created: string;
        Updated: string;
        Role: number;
        MemberStatus: number;
        NameTag: string;
        PhoneNumber: string;
        SlackId: string;
    };
    EventType: number;
    Status: number;
    SalaryStatus: number;
    InvoiceHoogiaId: number;
    InvoiceAddress: string;
    InvoiceTag: string;
    Invoicenumber: string;
    Note: string;
    ReturnalNote: string;
    PricePlan: number;
    AccountKind: number;
    Location: string;
    ContactPersonName: string;
    ContactPersonPhone: string;
    ContactPersonEmail: string;
}
