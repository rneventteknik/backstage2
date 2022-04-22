import { BaseEntityWithName } from './BaseEntity';
import { BookingChangelogEntry } from './ChangeLogEntry';
import { BookingType } from '../enums/BookingType';
import { AccountKind } from '../enums/AccountKind';
import { PricePlan } from '../enums/PricePlan';
import { EquipmentList } from './EquipmentList';
import { TimeEstimate } from './TimeEstimate';
import { TimeReport } from './TimeReport';
import { User } from './User';
import { Status } from '../enums/Status';
import { SalaryStatus } from '../enums/SalaryStatus';

export interface Booking extends BaseEntityWithName {
    ownerUser?: User;
    coOwnerUsers?: User[];
    equipmentLists?: EquipmentList[];
    timeEstimates?: TimeEstimate[];
    timeReports?: TimeReport[];
    changelog?: BookingChangelogEntry[];
    bookingType: BookingType;
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
    calendarBookingId: string;
    customerName: string;
}
