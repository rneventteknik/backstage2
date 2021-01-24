import { BaseEntityWithName } from "./BaseEntity";
import { AccountKind } from "./enums/AccountKind";
import { User } from "./User";

export interface TimeReport extends BaseEntityWithName {
    user: User;
    actualWorkingHours: number;
    billableWorkingHours: number;
    StartDatetime: Date
    EndDatetime: Date
    PricePerHour: number;
    AccountKind: AccountKind;
}
