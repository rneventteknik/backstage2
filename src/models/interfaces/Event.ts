import { BaseEntityWithName } from './BaseEntity';
import { EventChangelogEntry } from './ChangeLogEntry';
import { EventType } from '../enums/EventType';
import { AccountKind } from '../enums/AccountKind';
import { PricePlan } from '../enums/PricePlan';
import { EquipmentList } from './EquipmentList';
import { TimeEstimate } from './TimeEstimate';
import { TimeReport } from './TimeReport';
import { User } from './User';
import { Status } from '../enums/Status';
import { SalaryStatus } from '../enums/SalaryStatus';

export interface Event extends BaseEntityWithName {
    ownerUser?: User;
    coOwnerUsers?: User[];
    equipmenttLists?: EquipmentList[];
    timeEstimates?: TimeEstimate[];
    timeReports?: TimeReport[];
    changelog?: EventChangelogEntry[];
    eventType: EventType;
    status: Status;
    salaryStatus: SalaryStatus;
    invoiceHogiaId: number;
    invoiceAddress: string;
    invoiceTag: string;
    invoiceNumber: string;
    pricePlan: PricePlan;
    accountKind: AccountKind;
    note: string;
    returnalNote: string;
    location: string;
    contactPersonName: string;
    contactPersonPhone: string;
    contactPersonEmail: string;
    calendarEventId: string;
    customerName: string;
}
