import { EventApiModel } from '../../interfaces/api-models';
import { knex } from '../database';

interface EventDatabaseModel {
    /* Event properties */
    EventId: number;
    EventName: string;
    EventCreated: string;
    EventUpdated: string;
    OwnerUserId: number;
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
    /* User properties */
    UserId: number;
    UserName: string;
    UserCreated: string;
    UserUpdated: string;
    Role: number;
    MemberStatus: number;
    NameTag: string;
    PhoneNumber: string;
    SlackId: string;
}

export const fetchEvents = (): Promise<EventApiModel[]> => {
    return knex
        .from('Event')
        .leftJoin('User', 'Event.OwnerUserId', 'User.Id')
        .select<EventDatabaseModel[]>(
            'Event.Id as EventId',
            'Event.Name as EventName',
            'Event.Created as EventCreated',
            'Event.Updated as EventUpdated',
            'Event.OwnerUserId',
            'Event.EventType',
            'Event.Status',
            'Event.SalaryStatus',
            'Event.InvoiceHoogiaId',
            'Event.InvoiceAddress',
            'Event.InvoiceTag',
            'Event.Invoicenumber',
            'Event.Note',
            'Event.ReturnalNote',
            'Event.PricePlan',
            'Event.AccountKind',
            'Event.Location',
            'Event.ContactPersonName',
            'Event.ContactPersonPhone',
            'Event.ContactPersonEmail',
            'User.Id as UserId',
            'User.Name as UserName',
            'User.Created as UserCreated',
            'User.Updated as UserUpdated',
            'User.Role',
            'User.MemberStatus',
            'User.NameTag',
            'User.PhoneNumber',
            'User.SlackId',
        )
        .then((events) => events.map(toEventApi));
};

const toEventApi = (databaseModel: EventDatabaseModel): EventApiModel => {
    return {
        Id: databaseModel.EventId,
        Name: databaseModel.EventName,
        Created: databaseModel.EventCreated,
        Updated: databaseModel.EventUpdated,
        OwnerUser: {
            Id: databaseModel.UserId,
            Name: databaseModel.UserName,
            Created: databaseModel.UserCreated,
            Updated: databaseModel.UserUpdated,
            Role: databaseModel.Role,
            MemberStatus: databaseModel.MemberStatus,
            NameTag: databaseModel.NameTag,
            PhoneNumber: databaseModel.PhoneNumber,
            SlackId: databaseModel.SlackId,
        },
        EventType: databaseModel.EventType,
        Status: databaseModel.Status,
        SalaryStatus: databaseModel.SalaryStatus,
        InvoiceHoogiaId: databaseModel.InvoiceHoogiaId,
        InvoiceAddress: databaseModel.InvoiceAddress,
        InvoiceTag: databaseModel.InvoiceTag,
        Invoicenumber: databaseModel.Invoicenumber,
        Note: databaseModel.Note,
        ReturnalNote: databaseModel.ReturnalNote,
        PricePlan: databaseModel.PricePlan,
        AccountKind: databaseModel.AccountKind,
        Location: databaseModel.Location,
        ContactPersonName: databaseModel.ContactPersonName,
        ContactPersonPhone: databaseModel.ContactPersonPhone,
        ContactPersonEmail: databaseModel.ContactPersonEmail,
    };
};
