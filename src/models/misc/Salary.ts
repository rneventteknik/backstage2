import { User } from '../interfaces';

export interface SalaryReport {
    name: string;
    userSalaryReports: UserSalaryReport[];
}

export interface UserSalaryReport {
    userId: string;
    user: User;
    salaryLines: SalaryLine[];
    sum: number;
}

export interface SalaryLine {
    rs: string;
    date: string;
    name: string;
    hours: number;
    hourlyRate: number;
    sum: number;
    timeReportId: number;
}
