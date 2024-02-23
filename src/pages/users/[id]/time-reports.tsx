import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
import Header from '../../../components/layout/Header';
import { TableLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { bookingsFetcher, userFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { KeyValue } from '../../../models/interfaces/KeyValue';
import { TableConfiguration, TableDisplay } from '../../../components/TableDisplay';
import { BookingViewModel, TimeReport } from '../../../models/interfaces';
import TableStyleLink from '../../../components/utils/TableStyleLink';
import { getBookingDateHeadingValue, getFormattedInterval, toBookingViewModel } from '../../../lib/datetimeUtils';
import { getGlobalSetting, groupBy, reduceSumFn } from '../../../lib/utils';
import { getSortedList } from '../../../lib/sortIndexUtils';
import { formatNumberAsCurrency, getSalaryForTimeReport } from '../../../lib/pricingUtils';
import { SalaryStatus } from '../../../models/enums/SalaryStatus';
import TimeReportHourDisplay from '../../../components/utils/TimeReportHourDisplay';
import DoneIcon from '../../../components/utils/DoneIcon';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

interface TimeReportViewModel extends TimeReport {
    booking: BookingViewModel;
    displayWorkingInterval: string;
    hourlyRate: number;
    salarySum: number;
}

type MonthlyTimeReports = {
    label: string;
    id: number;
    sortIndex: number;
    timeReports: TimeReportViewModel[];
};

const TimeReportsPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const router = useRouter();
    const { data: user, error, isValidating } = useSwr('/api/users/' + router.query.id, userFetcher);
    const { data: timeReportBookings } = useSwr(
        '/api/users/' + router.query.id + '/timeReportBookings',
        bookingsFetcher,
    );

    if (error) {
        return (
            <ErrorPage
                errorMessage={error.message}
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            />
        );
    }

    if (isValidating || !user || !timeReportBookings) {
        return <TableLoadingPage fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    // The page itself
    //
    const pageTitle = 'Tidrapporter: ' + user?.name;
    const breadcrumbs = [
        { link: '/users', displayName: 'Användare' },
        { link: '/users/' + user.id, displayName: user?.name },
        { link: '/users/' + user.id + '/time-reports', displayName: 'Tidrapporter' },
    ];

    // Calculate time reports data
    //
    const wageRatioExternal = Number(getGlobalSetting('salary.wageRatio.external', globalSettings));
    const wageRatioThs = Number(getGlobalSetting('salary.wageRatio.ths', globalSettings));

    const timeReports: TimeReportViewModel[] = timeReportBookings?.flatMap((booking) =>
        (booking.timeReports ?? [])
            ?.filter((timeReport) => timeReport.userId === user.id)
            .map((x) => ({
                ...x,
                booking: toBookingViewModel(booking),
                displayWorkingInterval: getFormattedInterval(x.startDatetime, x.endDatetime, true),
                salarySum: getSalaryForTimeReport(x, booking, '', wageRatioExternal, wageRatioThs).sum,
                hourlyRate: getSalaryForTimeReport(x, booking, '', wageRatioExternal, wageRatioThs).hourlyRate,
            })),
    );

    // Group by month
    const timeReportsByBookingMonth = groupBy(timeReports, (timeReport) =>
        getBookingDateHeadingValue(timeReport.booking),
    );
    const monthlyTimeReports: MonthlyTimeReports[] = [];
    for (const month in timeReportsByBookingMonth) {
        const timeReportsForBookingMonth = timeReportsByBookingMonth[month];

        monthlyTimeReports.push({
            label: month,
            id: monthlyTimeReports.length + 1,
            sortIndex: -(timeReportsForBookingMonth[0].booking.usageStartDatetime?.getTime() ?? 0), // Use the time of one of the bookings for sorting
            timeReports: timeReportsForBookingMonth,
        });
    }

    // Table display functions
    //
    const TimeReportNameDisplayFn = (timeReport: TimeReportViewModel) => (
        <>
            <p className="mb-0">{timeReport.name}</p>
            <p className="text-muted mb-0 d-lg-none">
                <TimeReportHourDisplay timeReport={timeReport} />
            </p>
            <TableStyleLink className="text-muted" href={'/bookings/' + timeReport.booking.id}>
                {timeReport.booking.name}
            </TableStyleLink>
            <p className="text-muted mb-0">{timeReport.displayWorkingInterval ?? '-'}</p>
        </>
    );

    const TimeReportBillableWorkingHoursDisplayFn = (timeReport: TimeReportViewModel) => (
        <TimeReportHourDisplay timeReport={timeReport} />
    );

    const TimeReportHourlyRateDisplayFn = (timeReport: TimeReportViewModel) =>
        formatNumberAsCurrency(timeReport.hourlyRate);
    const TimeReportSumDisplayFn = (timeReport: TimeReportViewModel) => formatNumberAsCurrency(timeReport.salarySum);
    const TimeReportSentDisplayFn = (timeReport: TimeReportViewModel) =>
        timeReport.booking.salaryStatus === SalaryStatus.SENT ? <DoneIcon /> : <></>;

    // Use custom sort function
    const sortByTimeFn = (a: TimeReportViewModel, b: TimeReportViewModel): number => {
        if ((a.startDatetime ?? 0) < (b.startDatetime ?? 0)) {
            return -1;
        }

        if ((a.startDatetime ?? 0) > (b.startDatetime ?? 0)) {
            return 1;
        }

        return 0;
    };

    const tableSettings: TableConfiguration<TimeReportViewModel> = {
        entityTypeDisplayName: 'bokningar',
        defaultSortPropertyName: 'date',
        customSortFn: sortByTimeFn,
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Tidrapport',
                getValue: (timeReport: TimeReportViewModel) => timeReport.name,
                getContentOverride: TimeReportNameDisplayFn,
            },
            {
                key: 'hours',
                displayName: 'Fakturerade timmar',
                getValue: (timeReport: TimeReportViewModel) => timeReport.billableWorkingHours,
                getContentOverride: TimeReportBillableWorkingHoursDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
                cellHideSize: 'lg',
            },
            {
                key: 'hourly-rate',
                displayName: 'Timlön',
                getValue: (timeReport: TimeReportViewModel) => timeReport.hourlyRate,
                getContentOverride: TimeReportHourlyRateDisplayFn,
                textAlignment: 'right',
                columnWidth: 120,
                cellHideSize: 'lg',
            },
            {
                key: 'summa',
                displayName: 'Summa',
                getValue: (timeReport: TimeReportViewModel) => timeReport.salarySum,
                getContentOverride: TimeReportSumDisplayFn,
                textAlignment: 'right',
                columnWidth: 120,
            },
            {
                key: 'sent',
                displayName: 'Skickad',
                getValue: (timeReport: TimeReportViewModel) =>
                    timeReport.booking.salaryStatus === SalaryStatus.SENT ? 'Ja' : 'Nej',
                getContentOverride: TimeReportSentDisplayFn,
                textAlignment: 'center',
                columnWidth: 80,
                cellHideSize: 'lg',
            },
        ],
    };

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs} />

            <Card className="mb-3">
                <Card.Header className="p-1"></Card.Header>
                <Card.Body>
                    <p className="text-muted flex-grow-1 mb-0">
                        <strong>Notera:</strong> Beroende på hur länge bokningar pågår, när bokningar klarmarkeras, och
                        andra faktorer så kan timarvode i vissa fall betalas ut i en senare månad än angett nedan.
                    </p>
                </Card.Body>
            </Card>

            {getSortedList(monthlyTimeReports).map((timeReportMonth) => (
                <Card className="mb-3 mt-3" key={timeReportMonth.id}>
                    <Card.Header>
                        <strong>{timeReportMonth.label}</strong>
                    </Card.Header>
                    <TableDisplay entities={timeReportMonth.timeReports} configuration={tableSettings} />
                    <Card.Footer>
                        Totalt timarvode för perioden:{' '}
                        {formatNumberAsCurrency(
                            timeReportMonth.timeReports.map((x) => x.salarySum).reduce(reduceSumFn),
                        )}
                    </Card.Footer>
                </Card>
            ))}
        </Layout>
    );
};

export default TimeReportsPage;
