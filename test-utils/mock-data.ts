import { CurrentUserInfo } from '../interfaces/auth/CurrentUserInfo';
import { Role } from '../interfaces/enums/Role';

export const mockAdminUser: CurrentUserInfo = {
    isLoggedIn: true,
    userId: 42,
    name: 'Admin User',
    role: Role.ADMIN,
};

export const mockEvents = [
    {
        id: 11,
        name: 'Event 1',
        created: '2021-05-11T22:00:00.000Z',
        updated: '2021-05-11T22:00:00.000Z',
        eventType: 1,
        status: 1,
        salaryStatus: null,
        invoiceHoogiaId: null,
        invoiceAddress: null,
        invoiceTag: null,
        note: null,
        returnalNote: null,
        pricePlan: null,
        accountKind: null,
        location: null,
        contactPersonName: 'Person 1',
        contactPersonPhone: null,
        contactPersonEmail: null,
        ownerUserId: 100,
        invoiceNumber: null,
    },
    {
        id: 12,
        name: 'Event 2',
        created: '2021-05-11T22:00:00.000Z',
        updated: '2021-05-11T22:00:00.000Z',
        eventType: 1,
        status: 1,
        salaryStatus: null,
        invoiceHoogiaId: null,
        invoiceAddress: null,
        invoiceTag: null,
        note: null,
        returnalNote: null,
        pricePlan: null,
        accountKind: null,
        location: null,
        contactPersonName: 'Person 2',
        contactPersonPhone: null,
        contactPersonEmail: null,
        ownerUserId: 100,
        invoiceNumber: null,
    },
];

export const mockUsers = [
    {
        id: 100,
        name: 'User 1',
        created: null,
        updated: '2021-05-11T21:22:32.968Z',
        role: 1,
        memberStatus: 1,
        nameTag: 'U1',
        phoneNumber: '1',
        slackId: 'user1',
        personalIdentityNumber: '',
        bankName: '',
        clearingNumber: '',
        bankAccount: '',
        homeAddress: '',
        zipCode: '',
        emailAddress: 'user1@localhost',
    },
    {
        id: 101,
        name: 'User 2',
        created: null,
        updated: '2021-05-11T21:22:32.968Z',
        role: 1,
        memberStatus: 1,
        nameTag: 'U2',
        phoneNumber: '2',
        slackId: 'user2',
        personalIdentityNumber: '',
        bankName: '',
        clearingNumber: '',
        bankAccount: '',
        homeAddress: '',
        zipCode: '',
        emailAddress: 'user2@localhost',
    },
];
