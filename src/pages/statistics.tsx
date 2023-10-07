import React from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import useSwr from 'swr';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { Card, Nav, Tab } from 'react-bootstrap';
import { bookingsFetcher } from '../lib/fetchers';
import { getOperationalYear, groupBy, onlyUniqueById, reduceSumFn } from '../lib/utils';
import { TableLoadingPage } from '../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../components/layout/ErrorPage';
import { TableConfiguration, TableDisplay } from '../components/TableDisplay';
import { BookingViewModel } from '../models/interfaces';
import { getPrice, formatNumberAsCurrency, getBookingPrice } from '../lib/pricingUtils';
import { PricePlan } from '../models/enums/PricePlan';
import { getSortedList } from '../lib/sortIndexUtils';
import { Status } from '../models/enums/Status';
import { getNumberOfDays, toBookingViewModel } from '../lib/datetimeUtils';
import { KeyValue } from '../models/interfaces/KeyValue';
import currency from 'currency.js';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Statistik';
const breadcrumbs = [{ link: 'statistics', displayName: pageTitle }];

// Wrapper for yearly statistics
//
type YearlyStatistics = {
    label: string;
    equipment: EquipmentStatisticViewModel[];
    customer: CustomerStatisticViewModel[];
    user: UserStatisticViewModel[];
    id: number;
    sortIndex: number;
};

// This function splits the bookings by the statistical years and uses the helper functions below to
// calculate the different types of statistics per year (and a total).
// calculate the different types of statistics per year (and a all-time total).
const getStatistics = (bookings: BookingViewModel[]) => {
    // First add statistics by year
    const bookingsByYear = groupBy(bookings, (booking) => getOperationalYear(booking.usageStartDatetime));
    const yearlyStatistics: YearlyStatistics[] = [];
    for (const statisticalYear in bookingsByYear) {
        const bookingsForYear = bookingsByYear[statisticalYear];

        yearlyStatistics.push({
            label: statisticalYear,
            id: yearlyStatistics.length + 1,
            sortIndex: -(bookingsForYear[0].usageStartDatetime?.getTime() ?? 0), // User the time of one of the bookings for sorting
            equipment: getEquipmentStatistics(bookingsForYear),
            customer: getCustomerStatistics(bookingsForYear),
            user: getUserStatistics(bookingsForYear),
        });
    }

    const sortedStatistics = getSortedList(yearlyStatistics);

    // After the sorted yearly entries, add an entry for total
    sortedStatistics.push({
        label: 'Totalt',
        id: 0,
        equipment: getEquipmentStatistics(bookings),
        customer: getCustomerStatistics(bookings),
        user: getUserStatistics(bookings),
        sortIndex: Infinity,
    });

    return sortedStatistics;
};

// Equipment statistics
//
type EquipmentStatisticViewModel = {
    id: number;
    name: string;
    numberOfBookings: number;
    totalNumberOfUnitDays: number | null;
    totalNumberOfUnitHours: number | null;
    sum: number;
    percentTHS: number;
};

const getEquipmentStatistics = (bookings: BookingViewModel[]): EquipmentStatisticViewModel[] => {
    const allEquipmentEntries = bookings.flatMap((b) =>
        (b.equipmentLists ?? []).flatMap((l) =>
            [...l.listEntries, ...l.listHeadings.flatMap((x) => x.listEntries ?? [])].map((x) => ({
                ...x,
                list: l,
                booking: b,
            })),
        ),
    );
    const equipmentEntriesByEquipmentId = groupBy(allEquipmentEntries, (entry) => entry?.equipment?.id ?? 0);

    const equipmentStatistics: EquipmentStatisticViewModel[] = [];
    for (const equipmentId in equipmentEntriesByEquipmentId) {
        const entries = equipmentEntriesByEquipmentId[equipmentId];

        const bookingsForThisEquipment = entries.flatMap((x) => x.booking).filter(onlyUniqueById);

        equipmentStatistics.push({
            id: parseInt(equipmentId),
            name: entries[0]?.equipment?.name ?? 'Egna rader (totalt)',
            numberOfBookings: bookingsForThisEquipment.length,
            totalNumberOfUnitDays: entries.map((x) => x.numberOfUnits * getNumberOfDays(x.list)).reduce(reduceSumFn, 0),
            totalNumberOfUnitHours: entries.map((x) => x.numberOfUnits * x.numberOfHours).reduce(reduceSumFn, 0),
            sum: entries
                .filter((x) => x.booking.fixedPrice === null)
                .map((x) => getPrice(x, getNumberOfDays(x.list)))
                .reduce((a, b) => a.add(b), currency(0)).value,
            percentTHS:
                (bookingsForThisEquipment.filter((x) => x.pricePlan === PricePlan.THS).length /
                    bookingsForThisEquipment.length) *
                100,
        });
    }

    const fixedPriceBookings = bookings.filter((x) => x.fixedPrice !== null);
    if (fixedPriceBookings.length > 0) {
        equipmentStatistics.push({
            id: -1,
            name: 'Fast pris (totalt)',
            numberOfBookings: fixedPriceBookings.length,
            totalNumberOfUnitDays: null,
            totalNumberOfUnitHours: null,
            sum: bookings.map((x) => currency(x.fixedPrice ?? 0)).reduce((a, b) => a.add(b), currency(0)).value,
            percentTHS: (bookings.filter((x) => x.pricePlan === PricePlan.THS).length / bookings.length) * 100,
        });
    }

    return equipmentStatistics;
};

// Customer statistics
//
type CustomerStatisticViewModel = {
    id: number;
    name: string;
    numberOfBookings: number;
    totalNumberOfHours: number;
    sum: number;
    percentTHS: number;
};

const getCustomerStatistics = (bookings: BookingViewModel[]): CustomerStatisticViewModel[] => {
    const bookingsByCustomer = groupBy(bookings, (booking) => booking?.customerName ?? 'N/A');

    const customerStatistics: CustomerStatisticViewModel[] = [];
    let counter = 1;
    for (const customerName in bookingsByCustomer) {
        const bookings = bookingsByCustomer[customerName];

        customerStatistics.push({
            id: counter++,
            name: customerName,
            numberOfBookings: bookings.length,
            totalNumberOfHours: bookings
                .flatMap((booking) => booking.timeReports?.flatMap((x) => x.billableWorkingHours) ?? [])
                .reduce(reduceSumFn, 0),
            sum: bookings.map((x) => getBookingPrice(x)).reduce((a, b) => a.add(b), currency(0)).value,
            percentTHS: (bookings.filter((x) => x.pricePlan === PricePlan.THS).length / bookings.length) * 100,
        });
    }

    return customerStatistics;
};

// User statistics
//
type UserStatisticViewModel = {
    id: number;
    name: string;
    numberOfBookings: number;
    totalNumberOfBillableHours: number;
    totalNumberOfActualHours: number;
    sum: number;
    percentTHS: number;
};

const getUserStatistics = (bookings: BookingViewModel[]): UserStatisticViewModel[] => {
    const allTimeReports = bookings.flatMap((b) => b.timeReports?.map((x) => ({ ...x, booking: b })) ?? []);
    const timeReportsByUser = groupBy(allTimeReports, (report) => report?.user?.id ?? 0);

    const userStatistics: UserStatisticViewModel[] = [];
    for (const userId in timeReportsByUser) {
        const reports = timeReportsByUser[userId];

        const bookingsForThisUser = reports.flatMap((x) => x.booking).filter(onlyUniqueById);

        userStatistics.push({
            id: parseInt(userId),
            name: reports[0]?.user?.name ?? 'N/A',
            numberOfBookings: bookingsForThisUser.length,
            totalNumberOfBillableHours: reports.map((x) => x.billableWorkingHours).reduce(reduceSumFn, 0),
            totalNumberOfActualHours: reports.map((x) => x.actualWorkingHours).reduce(reduceSumFn, 0),
            sum: reports
                .map((x) => currency(x.billableWorkingHours).multiply(x.pricePerHour))
                .reduce((a, b) => a.add(b), currency(0)).value,
            percentTHS:
                (bookingsForThisUser.filter((x) => x.pricePlan === PricePlan.THS).length / bookingsForThisUser.length) *
                100,
        });
    }

    return userStatistics;
};

// Page
//
const StatisticsPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const {
        data: bookings,
        error,
        isValidating,
    } = useSwr('/api/bookings', bookingsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

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

    if (isValidating || !bookings) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    const bookingsViewModels = bookings
        ?.map(toBookingViewModel)
        ?.filter((b) => b.usageStartDatetime && b.status === Status.DONE);

    // Table display functions
    //
    const totalNumberOfUnitHoursDisplayFn = (model: EquipmentStatisticViewModel) =>
        model.totalNumberOfUnitHours ?? 0 > 0 ? model.totalNumberOfUnitHours + ' h' : '-';
    const totalNumberOfUnitDaysDisplayFn = (model: EquipmentStatisticViewModel) =>
        model.totalNumberOfUnitDays ?? 0 > 0 ? model.totalNumberOfUnitDays + ' st' : '-';

    const totalNumberOfHoursDisplayFn = (model: CustomerStatisticViewModel) => model.totalNumberOfHours + ' h';

    const totalNumberOfBillableHoursDisplayFn = (model: UserStatisticViewModel) =>
        model.totalNumberOfBillableHours + ' h';
    const totalNumberOfActualHoursDisplayFn = (model: UserStatisticViewModel) => model.totalNumberOfActualHours + ' h';

    const sumDisplayFn = (model: { sum: number }) => formatNumberAsCurrency(model.sum);
    const percentTHSDisplayFn = (model: { percentTHS: number }) => Math.round(model.percentTHS) + '%';

    const equipmentStatisticsTableSettings: TableConfiguration<EquipmentStatisticViewModel> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'sum',
        defaultSortAscending: false,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (model: EquipmentStatisticViewModel) => model.name,
            },
            {
                key: 'numberOfBookings',
                displayName: 'Antal bokningar',
                getValue: (model: EquipmentStatisticViewModel) => model.numberOfBookings,
                textAlignment: 'right',
                cellHideSize: 'sm',
                columnWidth: 150,
            },
            {
                key: 'totalNumberOfUnits',
                displayName: 'Uthyrda dagar',
                getValue: (model: EquipmentStatisticViewModel) => model.totalNumberOfUnitDays ?? -1,
                getContentOverride: totalNumberOfUnitDaysDisplayFn,
                textAlignment: 'right',
                cellHideSize: 'md',
                columnWidth: 220,
            },
            {
                key: 'totalnumberOfHours',
                displayName: 'Timmar använt',
                getValue: (model: EquipmentStatisticViewModel) => model.totalNumberOfUnitHours ?? -1,
                getContentOverride: totalNumberOfUnitHoursDisplayFn,
                textAlignment: 'right',
                cellHideSize: 'md',
                columnWidth: 220,
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (model: EquipmentStatisticViewModel) => model.sum,
                getContentOverride: sumDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
            },
            {
                key: 'percentTHS',
                displayName: 'Procent internt',
                getValue: (model: EquipmentStatisticViewModel) => model.percentTHS,
                getContentOverride: percentTHSDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
            },
        ],
    };

    const customerStatisticsTableSettings: TableConfiguration<CustomerStatisticViewModel> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'sum',
        defaultSortAscending: false,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Kunder',
                getValue: (model: CustomerStatisticViewModel) => model.name,
            },
            {
                key: 'numberOfBookings',
                displayName: 'Antal bokningar',
                getValue: (model: CustomerStatisticViewModel) => model.numberOfBookings,
                textAlignment: 'right',
                cellHideSize: 'sm',
                columnWidth: 150,
            },
            {
                key: 'totalnumberOfHours',
                displayName: 'Fakturerade timmar',
                getValue: (model: CustomerStatisticViewModel) => model.totalNumberOfHours,
                getContentOverride: totalNumberOfHoursDisplayFn,
                textAlignment: 'right',
                cellHideSize: 'md',
                columnWidth: 220,
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (model: CustomerStatisticViewModel) => model.sum,
                getContentOverride: sumDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
            },
            {
                key: 'percentTHS',
                displayName: 'Procent internt',
                getValue: (model: CustomerStatisticViewModel) => model.percentTHS,
                getContentOverride: percentTHSDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
            },
        ],
    };

    const userStatisticsTableSettings: TableConfiguration<UserStatisticViewModel> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'sum',
        defaultSortAscending: false,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: 'Användare',
                getValue: (model: UserStatisticViewModel) => model.name,
            },
            {
                key: 'numberOfBookings',
                displayName: 'Antal bokningar',
                getValue: (model: UserStatisticViewModel) => model.numberOfBookings,
                textAlignment: 'right',
                cellHideSize: 'sm',
                columnWidth: 150,
            },
            {
                key: 'totalNumberOfUnits',
                displayName: 'Arbetade timmar',
                getValue: (model: UserStatisticViewModel) => model.totalNumberOfActualHours,
                getContentOverride: totalNumberOfActualHoursDisplayFn,
                textAlignment: 'right',
                cellHideSize: 'md',
                columnWidth: 220,
            },
            {
                key: 'totalnumberOfHours',
                displayName: 'Fakturerade timmar',
                getValue: (model: UserStatisticViewModel) => model.totalNumberOfBillableHours,
                getContentOverride: totalNumberOfBillableHoursDisplayFn,
                textAlignment: 'right',
                cellHideSize: 'md',
                columnWidth: 220,
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (model: UserStatisticViewModel) => model.sum,
                getContentOverride: sumDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
            },
            {
                key: 'percentTHS',
                displayName: 'Procent internt',
                getValue: (model: UserStatisticViewModel) => model.percentTHS,
                getContentOverride: percentTHSDisplayFn,
                textAlignment: 'right',
                columnWidth: 150,
            },
        ],
    };

    const statistics = getStatistics(bookingsViewModels);

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

            <Tab.Container id="statistics-tabs" defaultActiveKey="equipment" transition={false}>
                <Nav variant="pills" className="flex-row">
                    <Nav.Item>
                        <Nav.Link eventKey="equipment">Utrustning</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="customers">Kunder</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="users">Användare</Nav.Link>
                    </Nav.Item>
                </Nav>
                <p className="text-muted font-italic mt-2">
                    Statistiken nedan är presenterad exklusive moms och endast klarmarkerade bokningar är inkluderade.
                </p>
                <Tab.Content>
                    <Tab.Pane eventKey="equipment">
                        {statistics.map((yearlyStatistics) => (
                            <Card className="mb-3 mt-3" key={yearlyStatistics.id}>
                                <Card.Header>{yearlyStatistics.label}</Card.Header>
                                <TableDisplay
                                    entities={yearlyStatistics.equipment}
                                    configuration={equipmentStatisticsTableSettings}
                                />
                            </Card>
                        ))}
                    </Tab.Pane>
                    <Tab.Pane eventKey="customers">
                        {statistics.map((yearlyStatistics) => (
                            <Card className="mb-3 mt-3" key={yearlyStatistics.id}>
                                <Card.Header>{yearlyStatistics.label}</Card.Header>
                                <TableDisplay
                                    entities={yearlyStatistics.customer}
                                    configuration={customerStatisticsTableSettings}
                                />
                            </Card>
                        ))}
                    </Tab.Pane>
                    <Tab.Pane eventKey="users">
                        {statistics.map((yearlyStatistics) => (
                            <Card className="mb-3 mt-3" key={yearlyStatistics.id}>
                                <Card.Header>{yearlyStatistics.label}</Card.Header>
                                <TableDisplay
                                    entities={yearlyStatistics.user}
                                    configuration={userStatisticsTableSettings}
                                />
                            </Card>
                        ))}{' '}
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Layout>
    );
};

export default StatisticsPage;
