import React, { useState } from 'react';
import { ErrorPage } from '../components/layout/ErrorPage';
import Header from '../components/layout/Header';
import Layout from '../components/layout/Layout';
import { TableLoadingPage } from '../components/layout/LoadingPageSkeleton';
import { salaryGroupsFetcher } from '../lib/fetchers';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import useSwr from 'swr';
import { Role } from '../models/enums/Role';
import { TableConfiguration, TableDisplay } from '../components/TableDisplay';
import { SalaryGroup } from '../models/interfaces/SalaryGroup';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ISalaryGroupObjectionModel } from '../models/objection-models/SalaryGroupObjectionModel';
import { PartialDeep } from 'type-fest';
import { useNotifications } from '../lib/useNotifications';
import { getResponseContentOrError } from '../lib/utils';
import DoneIcon from '../components/utils/DoneIcon';
import { formatDatetime, formatDatetimeForForm } from '../lib/datetimeUtils';
import CreateSalaryGroupModal from '../components/salaries/CreateSalaryGroupModal';
import ViewSalaryGroupModal from '../components/salaries/ViewSalaryGroupModal';
import { KeyValue } from '../models/interfaces/KeyValue';
import { SalaryStatus } from '../models/enums/SalaryStatus';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.ADMIN);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Timarvodesunderlag';
const breadcrumbs = [{ link: '/salary/', displayName: pageTitle }];

const SalaryGroupPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const {
        data: salaryGroups,
        error,
        mutate,
    } = useSwr('/api/salaryGroups', salaryGroupsFetcher, { revalidateOnFocus: false, revalidateOnReconnect: false });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [salaryGroupToViewId, setSalaryGroupToViewId] = useState<number | null>(null);
    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

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

    if (!salaryGroups && salaryGroupToViewId === null) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    const createSalaryGroup = (newSalaryGroup: PartialDeep<ISalaryGroupObjectionModel>) => {
        const body = { salaryGroup: { ...newSalaryGroup, userId: currentUser.userId } };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/salaryGroups', request)
            .then((apiResponse) => getResponseContentOrError<ISalaryGroupObjectionModel>(apiResponse))
            .then((data) => {
                mutate();
                showCreateSuccessNotification('Timarvodesunderlagsgruppen');
                if (data.id) {
                    setSalaryGroupToViewId(data.id);
                }
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Timarvodesunderlagsgruppen');
            });
    };

    const salaryGroupNameDisplayFn = (salaryGroup: SalaryGroup) => (
        <div onClick={() => setSalaryGroupToViewId(salaryGroup.id)} role="button" tabIndex={0}>
            <p className="mb-0">{salaryGroup.name ?? '-'}</p>
            <p className="text-muted mb-0">
                {salaryGroup.bookings?.length ?? 'N/A'} {salaryGroup.bookings?.length === 1 ? 'bokning' : 'bokningar'}
            </p>
            <p className="text-muted mb-0 d-sm-none">{getSalaryStatusString(salaryGroup)}</p>
            <p className="text-muted mb-0 d-lg-none">{salaryGroup.user?.name}</p>
        </div>
    );

    const salaryStatusDisplayFn = (salaryGroup: SalaryGroup) => (
        <>
            {getSalaryStatusString(salaryGroup)}
            {getSalaryStatusString(salaryGroup) === 'Skickad' ? <DoneIcon /> : null}
        </>
    );

    const createdDisplayFn = (salaryGroup: SalaryGroup) => (
        <>{salaryGroup.created ? formatDatetime(salaryGroup.created) : '-'}</>
    );

    const salaryGroupActionsDisplayFn = (salaryGroup: SalaryGroup) => (
        <>
            <Button
                variant="secondary"
                size="sm"
                className="d-inline mr-2"
                onClick={() => setSalaryGroupToViewId(salaryGroup.id)}
            >
                Visa
            </Button>
        </>
    );

    const getSalaryStatusString = (salaryGroup: SalaryGroup): string => {
        if (salaryGroup.bookings?.every((b) => b.salaryStatus === SalaryStatus.SENT)) {
            return 'Skickad';
        }

        if (salaryGroup.bookings?.some((b) => b.salaryStatus === SalaryStatus.SENT)) {
            return 'Delvis skickad';
        }

        return 'Inte skickad';
    };

    const tableSettings: TableConfiguration<SalaryGroup> = {
        entityTypeDisplayName: 'Timarvodesunderlagsgrupper',
        defaultSortPropertyName: 'created',
        defaultSortAscending: false,
        columns: [
            {
                key: 'name',
                displayName: 'Timarvodesunderlagsgrupp',
                getValue: (salaryGroup: SalaryGroup) => salaryGroup.name,
                textTruncation: true,
                getContentOverride: salaryGroupNameDisplayFn,
            },
            {
                key: 'status',
                displayName: 'Status',
                getValue: (salaryGroup: SalaryGroup) => getSalaryStatusString(salaryGroup),
                textTruncation: true,
                getContentOverride: salaryStatusDisplayFn,
                cellHideSize: 'sm',
            },
            {
                key: 'user',
                displayName: 'Användare',
                getValue: (salaryGroup: SalaryGroup) => salaryGroup.user?.name ?? '-',
                textTruncation: true,
                cellHideSize: 'lg',
            },
            {
                key: 'created',
                displayName: 'Skapad',
                getValue: (salaryGroup: SalaryGroup) =>
                    salaryGroup.created ? formatDatetimeForForm(salaryGroup.created) : '-',
                getContentOverride: createdDisplayFn,
                textTruncation: true,
                cellHideSize: 'xl',
                columnWidth: 170,
            },
            {
                key: 'actions',
                displayName: '',
                disableSort: true,
                getValue: () => '',
                getContentOverride: salaryGroupActionsDisplayFn,
                cellHideSize: 'xl',
                columnWidth: 80,
            },
        ],
    };

    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button onClick={() => setShowCreateModal(true)}>
                    <FontAwesomeIcon icon={faPlus} className="mr-1 fa-fw" /> Skapa Timarvodesunderlagsgrupp
                </Button>
            </Header>
            <TableDisplay entities={salaryGroups ?? []} configuration={{ ...tableSettings }} />
            <CreateSalaryGroupModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onCreate={createSalaryGroup}
            />
            <ViewSalaryGroupModal
                show={salaryGroupToViewId !== null}
                onHide={() => setSalaryGroupToViewId(null)}
                onMutate={() => mutate()}
                salaryGroup={salaryGroups?.find((x) => x.id === salaryGroupToViewId)}
            />
        </Layout>
    );
};

export default SalaryGroupPage;
