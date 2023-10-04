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
import { PaymentStatus } from '../enums/PaymentStatus';
import { Language } from '../enums/Language';

export interface Booking extends BaseEntityWithName {
    ownerUser?: User;
    ownerUserId?: number;
    coOwnerUsers?: User[];
    equipmentLists?: EquipmentList[];
    timeEstimates?: TimeEstimate[];
    timeReports?: TimeReport[];
    changelog?: BookingChangelogEntry[];
    bookingType: BookingType;
    status: Status;
    paymentStatus: PaymentStatus;
    salaryStatus: SalaryStatus;
    invoiceHogiaId: number | null;
    invoiceAddress: string;
    invoiceTag: string;
    invoiceNumber: string;
    pricePlan: PricePlan;
    accountKind: AccountKind | null;
    note: string;
    returnalNote: string;
    location: string;
    contactPersonName: string;
    contactPersonPhone: string;
    contactPersonEmail: string;
    calendarBookingId: string;
    driveFolderId: string;
    customerName: string;
    language: Language;
    fixedPrice: number | null;
}

export interface BookingViewModel extends Booking {
    equipmentOutDatetime?: Date;
    equipmentInDatetime?: Date;
    usageStartDatetime?: Date;
    usageEndDatetime?: Date;
    displayEquipmentOutString: string;
    displayEquipmentInString: string;
    displayUsageStartString: string;
    displayUsageEndString: string;
    displayUsageInterval: string;
    displayEquipmentOutInterval: string;
    isoFormattedUsageStartString: string;
    monthYearUsageStartString: string;
}
