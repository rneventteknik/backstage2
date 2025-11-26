import React from 'react';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { TextLoadingPage } from '../../../../../components/layout/LoadingPageSkeleton';
import { useUserWithDefaultAccessAndWithSettings } from '../../../../../lib/useUser';
import { KeyValue } from '../../../../../models/interfaces/KeyValue';
import { CurrentUserInfo } from '../../../../../models/misc/CurrentUserInfo';
import { ErrorPage } from '../../../../../components/layout/ErrorPage';
import { bookingFetcher, equipmentListFetcher } from '../../../../../lib/fetchers';
import { toBookingViewModel } from '../../../../../lib/datetimeUtils';
import Layout from '../../../../../components/layout/Layout';
import Header from '../../../../../components/layout/Header';
import { TableConfiguration, TableDisplay } from '../../../../../components/TableDisplay';
import { EquipmentListEntry } from '../../../../../models/interfaces/EquipmentList';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import Link from 'next/link';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { saveListEntryApiCall } from '../../../../../lib/equipmentListUtils';
import { useNotifications } from '../../../../../lib/useNotifications';
import { faCheckSquare } from '@fortawesome/free-regular-svg-icons';
import { Role } from '../../../../../models/enums/Role';
import { Status } from '../../../../../models/enums/Status';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const BookingPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { showSaveSuccessNotification, showSaveFailedNotification } = useNotifications();

    const router = useRouter();
    const { data: bookingData, error: bookingError } = useSwr('/api/bookings/' + router.query.id, bookingFetcher);
    const {
        data: list,
        error: listError,
        mutate: mutateList,
    } = useSwr('/api/bookings/' + router.query.id + '/equipmentLists/' + router.query.listId, equipmentListFetcher, {
        refreshInterval: 10000,
    });

    if (bookingError || listError) {
        return (
            <ErrorPage
                errorMessage={(bookingError ?? listError).message}
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            />
        );
    }

    if (!bookingData || !list) {
        return (
            <TextLoadingPage
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            ></TextLoadingPage>
        );
    }

    const booking = toBookingViewModel(bookingData);
    const allListEntries = [...list.listEntries, ...list.listHeadings.flatMap((x) => x.listEntries ?? [])];
    const readonly = currentUser.role === Role.READONLY || booking.status === Status.DONE;

    const saveListEntry = async (isPacked: boolean, listEntryId: number, bookingId: number) => {
        if (readonly) {
            return;
        }

        const entry: Partial<EquipmentListEntry> = {
            id: listEntryId,
            isPacked: isPacked,
        };
        saveListEntryApiCall(entry, bookingId)
            .then(() => {
                showSaveSuccessNotification('Listan');
                mutateList();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listan');
                mutateList();
            });
    };

    const markAllAsPacked = () => {
        if (readonly) {
            return;
        }

        const entries = allListEntries.map((entry) => ({
            id: entry.id,
            isPacked: true,
        }));
        Promise.all(entries.map(async (entry) => saveListEntryApiCall(entry, booking.id)))
            .then(() => {
                showSaveSuccessNotification('Listan');
                mutateList();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listan');
                mutateList();
            });
    };

    // The page itself
    //
    const pageTitle = list?.name;
    const breadcrumbs = [
        { link: '/bookings', displayName: 'Bokningar' },
        { link: '/bookings/' + booking.id, displayName: booking.name },
        { link: '/bookings/' + booking.id, displayName: pageTitle },
    ];

    const checkmarkDisplayFn = (entry: EquipmentListEntry) => (
        <div className="text-center">
            <input
                type="checkbox"
                checked={entry.isPacked}
                disabled={readonly}
                onChange={() => saveListEntry(!entry.isPacked, entry.id, booking.id)}
            />
        </div>
    );

    const EquipmentEntryNameDisplayFn = (entry: EquipmentListEntry) => (
        <div onClick={() => saveListEntry(!entry.isPacked, entry.id, booking.id)}>
            {entry.name}
            <div className="text-muted mb-0">{entry.description}</div>
        </div>
    );

    const tableSettings: TableConfiguration<EquipmentListEntry> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'location',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'checkmark',
                displayName: '',
                getValue: () => '',
                getContentOverride: checkmarkDisplayFn,
                columnWidth: 60,
                disableSort: true,
            },
            {
                key: 'count',
                displayName: 'Antal',
                getValue: (entry: EquipmentListEntry) => entry.numberOfUnits ?? '-',
                getContentOverride: (entry: EquipmentListEntry) =>
                    entry.numberOfUnits === null ? '-' : entry.numberOfUnits + ' st',
                getHeadingValue: (entry: EquipmentListEntry) =>
                    entry.numberOfUnits === null ? '-' : entry.numberOfUnits + ' st',
                textAlignment: 'center',
                columnWidth: 120,
                disableSort: true,
            },
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (entry: EquipmentListEntry) => entry.name + ' ' + entry.description,
                getHeadingValue: (entry: EquipmentListEntry) => entry.name.charAt(0),
                getContentOverride: EquipmentEntryNameDisplayFn,
                disableSort: true,
            },
            {
                key: 'location',
                displayName: 'Plats',
                getValue: (entry: EquipmentListEntry) => entry.equipment?.equipmentLocation?.name ?? 'Okänd plats',
                getHeadingValue: (entry: EquipmentListEntry) =>
                    entry.equipment?.equipmentLocation?.name ?? 'Okänd plats',
                cellHideSize: 'xl',
                columnWidth: 200,
                disableSort: true,
            },
        ],
    };

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="secondary" onClick={() => markAllAsPacked()} disabled={readonly}>
                    <FontAwesomeIcon icon={faCheckSquare} className="mr-1" /> Markera alla som packade
                </Button>
                <DropdownButton
                    id="other-lists-dropdown-button"
                    variant="secondary"
                    title="Välj lista"
                    className="d-inline-block"
                >
                    {booking.equipmentLists?.map((l) => (
                        <Link href={`/bookings/${booking.id}/equipmentList/${l.id}`} key={l.id} passHref>
                            <Dropdown.Item href={`/bookings/${booking.id}/equipmentList/${l.id}`}>
                                <FontAwesomeIcon icon={faListCheck} className="mr-1 fa-fw" /> {l.name}
                            </Dropdown.Item>
                        </Link>
                    ))}
                </DropdownButton>
            </Header>
            <TableDisplay entities={allListEntries} configuration={{ ...tableSettings }} />
        </Layout>
    );
};

export default BookingPage;
