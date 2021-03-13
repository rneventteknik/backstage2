import { EventApiModel, UserApiModel } from '../../interfaces/api-models';
import { knex } from '../database';
import { Model, initialize } from 'objection';

export const fetchEvents = async (): Promise<EventApiModel[]> => {
    Model.knex(knex);
    await initialize(knex, [EventApiModel, UserApiModel]);

    // const test: EventApiModel[] = await EventApiModel.query().withGraphJoined('OwnerUser');
    // console.log(test);

    // const query = EventApiModel.query().withGraphFetched('OwnerUser').debug();
    const query = UserApiModel.query().withGraphJoined('[OwnsEvent]').debug();

    knex.on('query', (data: unknown) => console.log(data));

    // console.log(await query2);
    // const res = await query;

    // console.log(
    //     await knex.raw(
    //         'select "Event"."Id" as "Id", "Event"."Name" as "Name", "Event"."Created" as "Created", "Event"."Updated" as "Updated", "Event"."OwnerUserId" as "OwnerUserId", "Event"."EventType" as "EventType", "Event"."Status" as "Status", "Event"."SalaryStatus" as "SalaryStatus", "Event"."InvoiceHoogiaId" as "InvoiceHoogiaId", "Event"."InvoiceAddress" as "InvoiceAddress", "Event"."InvoiceTag" as "InvoiceTag", "Event"."InvoiceNumber" as "InvoiceNumber", "Event"."Note" as "Note", "Event"."ReturnalNote" as "ReturnalNote", "Event"."PricePlan" as "PricePlan", "Event"."AccountKind" as "AccountKind", "Event"."Location" as "Location", "Event"."ContactPersonName" as "ContactPersonName", "Event"."ContactPersonPhone" as "ContactPersonPhone", "Event"."ContactPersonEmail" as "ContactPersonEmail", "OwnerUser"."Id" as "OwnerUser:Id", "OwnerUser"."Name" as "OwnerUser:Name", "OwnerUser"."Created" as "OwnerUser:Created", "OwnerUser"."Updated" as "OwnerUser:Updated", "OwnerUser"."Role" as "OwnerUser:Role", "OwnerUser"."MemberStatus" as "OwnerUser:MemberStatus", "OwnerUser"."NameTag" as "OwnerUser:NameTag", "OwnerUser"."PhoneNumber" as "OwnerUser:PhoneNumber", "OwnerUser"."SlackId" as "OwnerUser:SlackId" from "Event" left join "User" as "OwnerUser" on "OwnerUser"."Id" = "Event"."OwnerUserId" where "OwnerUserId" = 2 limit 3'
    //     )
    // );

    return query;
};

// interface EventDatabaseModel {
//     /* Event properties */
//     EventId: number;
//     EventName: string;
//     EventCreated: string;
//     EventUpdated: string;
//     OwnerUserId: number;
//     EventType: number;
//     Status: number;
//     SalaryStatus: number;
//     InvoiceHoogiaId: number;
//     InvoiceAddress: string;
//     InvoiceTag: string;
//     Invoicenumber: string;
//     Note: string;
//     ReturnalNote: string;
//     PricePlan: number;
//     AccountKind: number;
//     Location: string;
//     ContactPersonName: string;
//     ContactPersonPhone: string;
//     ContactPersonEmail: string;
//     /* User properties */
//     UserId: number;
//     UserName: string;
//     UserCreated: string;
//     UserUpdated: string;
//     Role: number;
//     MemberStatus: number;
//     NameTag: string;
//     PhoneNumber: string;
//     SlackId: string;
// }

// export const fetchEvents = (): Promise<EventApiModel[]> => {
//     return knex
//         .from('Event')
//         .leftJoin('User', 'Event.OwnerUserId', 'User.Id')
//         .select<EventDatabaseModel[]>(
//             'Event.Id as EventId',
//             'Event.Name as EventName',
//             'Event.Created as EventCreated',
//             'Event.Updated as EventUpdated',
//             'Event.OwnerUserId',
//             'Event.EventType',
//             'Event.Status',
//             'Event.SalaryStatus',
//             'Event.InvoiceHoogiaId',
//             'Event.InvoiceAddress',
//             'Event.InvoiceTag',
//             'Event.Invoicenumber',
//             'Event.Note',
//             'Event.ReturnalNote',
//             'Event.PricePlan',
//             'Event.AccountKind',
//             'Event.Location',
//             'Event.ContactPersonName',
//             'Event.ContactPersonPhone',
//             'Event.ContactPersonEmail',
//             'User.Id as UserId',
//             'User.Name as UserName',
//             'User.Created as UserCreated',
//             'User.Updated as UserUpdated',
//             'User.Role',
//             'User.MemberStatus',
//             'User.NameTag',
//             'User.PhoneNumber',
//             'User.SlackId',
//         )
//         .then((events) => events.map(toEventApi));
// };

// const toEventApi = (databaseModel: EventDatabaseModel): EventApiModel => {
//     return {
//         Id: databaseModel.EventId,
//         Name: databaseModel.EventName,
//         Created: databaseModel.EventCreated,
//         Updated: databaseModel.EventUpdated,
//         OwnerUser: {
//             Id: databaseModel.UserId,
//             Name: databaseModel.UserName,
//             Created: databaseModel.UserCreated,
//             Updated: databaseModel.UserUpdated,
//             Role: databaseModel.Role,
//             MemberStatus: databaseModel.MemberStatus,
//             NameTag: databaseModel.NameTag,
//             PhoneNumber: databaseModel.PhoneNumber,
//             SlackId: databaseModel.SlackId,
//         },
//         EventType: databaseModel.EventType,
//         Status: databaseModel.Status,
//         SalaryStatus: databaseModel.SalaryStatus,
//         InvoiceHoogiaId: databaseModel.InvoiceHoogiaId,
//         InvoiceAddress: databaseModel.InvoiceAddress,
//         InvoiceTag: databaseModel.InvoiceTag,
//         Invoicenumber: databaseModel.Invoicenumber,
//         Note: databaseModel.Note,
//         ReturnalNote: databaseModel.ReturnalNote,
//         PricePlan: databaseModel.PricePlan,
//         AccountKind: databaseModel.AccountKind,
//         Location: databaseModel.Location,
//         ContactPersonName: databaseModel.ContactPersonName,
//         ContactPersonPhone: databaseModel.ContactPersonPhone,
//         ContactPersonEmail: databaseModel.ContactPersonEmail,
//     };
// };
