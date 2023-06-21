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
    dimension1: string;
    date: string;
    name: string;
    hours: number;
    hourlyRate: number;
    sum: number;
    timeReportId: number;
}
