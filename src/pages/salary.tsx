import React, { useState } from 'react';
import { ErrorPage } from '../components/layout/ErrorPage';
import Header from '../components/layout/Header';
import Layout from '../components/layout/Layout';
import { TableLoadingPage } from '../components/layout/LoadingPageSkeleton';
import { salaryGroupsFetcher } from '../lib/fetchers';
import { useUserWithDefaultAccessControl } from '../lib/useUser';
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
import { PaymentStatus } from '../models/enums/PaymentStatus';
import DoneIcon from '../components/utils/DoneIcon';
import { formatDatetime } from '../lib/datetimeUtils';
import CreateSalaryGroupModal from '../components/salaries/CreateSalaryGroupModal';
import ViewSalaryGroupModal from '../components/salaries/ViewSalaryGroupModal';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl(Role.ADMIN);
type Props = { user: CurrentUserInfo };
const pageTitle = 'Löneunderlag';
const breadcrumbs = [{ link: '/salary/', displayName: pageTitle }];

const SalaryGroupPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: salaryGroups, error, isValidating, mutate } = useSwr('/api/salaryGroups', salaryGroupsFetcher);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [salaryGroupToViewId, setSalaryGroupToViewId] = useState<number | null>(null);
    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if ((isValidating || !salaryGroups) && salaryGroupToViewId === null) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} />;
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
                showCreateSuccessNotification('Löneunderlagsgruppen');
                if (data.id) {
                    setSalaryGroupToViewId(data.id);
                }
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Löneunderlagsgruppen');
            });
    };

    const salaryGroupNameDisplayFn = (salaryGroup: SalaryGroup) => (
        <div onClick={() => setSalaryGroupToViewId(salaryGroup.id)} role="button" tabIndex={0}>
            <p className="mb-0">{salaryGroup.name ?? '-'}</p>
            <p className="text-muted mb-0">
                {salaryGroup.bookings?.length ?? 'N/A'} {salaryGroup.bookings?.length === 1 ? 'bokning' : 'bokningar'}
            </p>
            <p className="text-muted mb-0 d-sm-none">{getPaymentStatusString(salaryGroup)}</p>
            <p className="text-muted mb-0 d-lg-none">{salaryGroup.user?.name}</p>
        </div>
    );

    const paymentStatusDisplayFn = (salaryGroup: SalaryGroup) => (
        <>
            {getPaymentStatusString(salaryGroup)}
            {getPaymentStatusString(salaryGroup) === 'Betald' ? <DoneIcon /> : null}
        </>
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

    const getPaymentStatusString = (salaryGroup: SalaryGroup): string | number | Date => {
        if (
            salaryGroup.bookings?.every(
                (b) => b.paymentStatus === PaymentStatus.PAID_WITH_INVOICE || b.paymentStatus === PaymentStatus.PAID,
            )
        ) {
            return 'Betald';
        }

        if (
            salaryGroup.bookings?.some(
                (b) => b.paymentStatus === PaymentStatus.PAID_WITH_INVOICE || b.paymentStatus === PaymentStatus.PAID,
            )
        ) {
            return 'Delvis betald';
        }

        if (
            salaryGroup.bookings?.every(
                (b) => b.paymentStatus === PaymentStatus.INVOICED || b.paymentStatus === PaymentStatus.PAID,
            )
        ) {
            return 'Fakturerad';
        }

        if (
            salaryGroup.bookings?.some(
                (b) => b.paymentStatus === PaymentStatus.INVOICED || b.paymentStatus === PaymentStatus.PAID,
            )
        ) {
            return 'Delvis fakturerad';
        }

        return 'Inte fakturerad';
    };

    const tableSettings: TableConfiguration<SalaryGroup> = {
        entityTypeDisplayName: 'Löneunderlagsgrupper',
        defaultSortPropertyName: 'created',
        defaultSortAscending: false,
        columns: [
            {
                key: 'name',
                displayName: 'Löneunderlagsgrupp',
                getValue: (salaryGroup: SalaryGroup) => salaryGroup.name,
                textTruncation: true,
                getContentOverride: salaryGroupNameDisplayFn,
            },
            {
                key: 'status',
                displayName: 'Status',
                getValue: (salaryGroup: SalaryGroup) => getPaymentStatusString(salaryGroup),
                textTruncation: true,
                getContentOverride: paymentStatusDisplayFn,
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
                    salaryGroup.created ? formatDatetime(salaryGroup.created) : '-',
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
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button onClick={() => setShowCreateModal(true)}>
                    <FontAwesomeIcon icon={faPlus} className="mr-1 fa-fw" /> Skapa Löneunderlagsgrupp
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
