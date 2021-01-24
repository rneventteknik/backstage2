import { BaseEntityWithName } from "./BaseEntity";
import { User } from "./User";

export interface SalaryGroup extends BaseEntityWithName {
    events: Event[];
    user: User;
}
