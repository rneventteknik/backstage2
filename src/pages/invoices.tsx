import React, { useState } from 'react';
import { ErrorPage } from '../components/layout/ErrorPage';
import Header from '../components/layout/Header';
import Layout from '../components/layout/Layout';
import { TableLoadingPage } from '../components/layout/LoadingPageSkeleton';
import { invoiceGroupsFetcher } from '../lib/fetchers';
import { useUserWithDefaultAccessControl } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import useSwr from 'swr';
import { Role } from '../models/enums/Role';
import { TableConfiguration, TableDisplay } from '../components/TableDisplay';
import { InvoiceGroup } from '../models/interfaces/InvoiceGroup';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CreateInvoiceGroupModal from '../components/invoices/CreateInvoiceGroupModal';
import { IInvoiceGroupObjectionModel } from '../models/objection-models/InvoiceGroupObjectionModel';
import { PartialDeep } from 'type-fest';
import { useNotifications } from '../lib/useNotifications';
import { formatDatetime, getResponseContentOrError } from '../lib/utils';
import ViewInvoiceGroupModal from '../components/invoices/ViewInvoiceGroupModal';
import { PaymentStatus } from '../models/enums/PaymentStatus';
import DoneIcon from '../components/utils/DoneIcon';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl(Role.ADMIN);
type Props = { user: CurrentUserInfo };
const pageTitle = 'Fakturaunderlag';
const breadcrumbs = [{ link: '/invoices/', displayName: pageTitle }];

const InvoiceGroupPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: invoiceGroups, error, isValidating, mutate } = useSwr('/api/invoiceGroups/', invoiceGroupsFetcher);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [invoiceGroupToViewId, setInvoiceGroupToViewId] = useState<number | null>(null);
    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if ((isValidating || !invoiceGroups) && invoiceGroupToViewId === null) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} />;
    }

    const createInvoiceGroup = (newInvoiceGroup: PartialDeep<IInvoiceGroupObjectionModel>) => {
        const body = { invoiceGroup: { ...newInvoiceGroup, userId: currentUser.userId } };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/invoiceGroups', request)
            .then((apiResponse) => getResponseContentOrError<IInvoiceGroupObjectionModel>(apiResponse))
            .then((data) => {
                mutate();
                showCreateSuccessNotification('Fakturaunderlagsgruppen');
                if (data.id) {
                    setInvoiceGroupToViewId(data.id);
                }
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Fakturaunderlagsgruppen');
            });
    };

    const invoiceGroupNameDisplayFn = (invoiceGroup: InvoiceGroup) => (
        <div onClick={() => setInvoiceGroupToViewId(invoiceGroup.id)} role="button" tabIndex={0}>
            <p className="mb-0">{invoiceGroup.name ?? '-'}</p>
            <p className="text-muted mb-0">
                {invoiceGroup.bookings?.length ?? 'N/A'} {invoiceGroup.bookings?.length === 1 ? 'bokning' : 'bokningar'}
            </p>
            <p className="text-muted mb-0 d-sm-none">{getPaymentStatusString(invoiceGroup)}</p>
            <p className="text-muted mb-0 d-lg-none">{invoiceGroup.user?.name}</p>
        </div>
    );

    const paymentStatusDisplayFn = (invoiceGroup: InvoiceGroup) => (
        <>
            {getPaymentStatusString(invoiceGroup)}
            {getPaymentStatusString(invoiceGroup) === 'Betald' ? <DoneIcon /> : null}
        </>
    );

    const invoiceGroupActionsDisplayFn = (invoiceGroup: InvoiceGroup) => (
        <>
            <Button
                variant="secondary"
                size="sm"
                className="d-inline mr-2"
                onClick={() => setInvoiceGroupToViewId(invoiceGroup.id)}
            >
                Visa
            </Button>
        </>
    );

    const getPaymentStatusString = (invoiceGroup: InvoiceGroup): string | number | Date => {
        if (
            invoiceGroup.bookings?.every(
                (b) => b.paymentStatus === PaymentStatus.PAID_WITH_INVOICE || b.paymentStatus === PaymentStatus.PAID,
            )
        ) {
            return 'Betald';
        }

        if (
            invoiceGroup.bookings?.some(
                (b) => b.paymentStatus === PaymentStatus.PAID_WITH_INVOICE || b.paymentStatus === PaymentStatus.PAID,
            )
        ) {
            return 'Delvis betald';
        }

        if (
            invoiceGroup.bookings?.every(
                (b) => b.paymentStatus === PaymentStatus.INVOICED || b.paymentStatus === PaymentStatus.PAID,
            )
        ) {
            return 'Fakturerad';
        }

        if (
            invoiceGroup.bookings?.some(
                (b) => b.paymentStatus === PaymentStatus.INVOICED || b.paymentStatus === PaymentStatus.PAID,
            )
        ) {
            return 'Delvis fakturerad';
        }

        return 'Inte fakturerad';
    };

    const tableSettings: TableConfiguration<InvoiceGroup> = {
        entityTypeDisplayName: 'fakturaunderlagsgrupper',
        defaultSortPropertyName: 'created',
        defaultSortAscending: false,
        columns: [
            {
                key: 'name',
                displayName: 'Fakturaunderlagsgrupp',
                getValue: (invoiceGroup: InvoiceGroup) => invoiceGroup.name,
                textTruncation: true,
                getContentOverride: invoiceGroupNameDisplayFn,
            },
            {
                key: 'status',
                displayName: 'Status',
                getValue: (invoiceGroup: InvoiceGroup) => getPaymentStatusString(invoiceGroup),
                textTruncation: true,
                getContentOverride: paymentStatusDisplayFn,
                cellHideSize: 'sm',
            },
            {
                key: 'user',
                displayName: 'Användare',
                getValue: (invoiceGroup: InvoiceGroup) => invoiceGroup.user?.name ?? '-',
                textTruncation: true,
                cellHideSize: 'lg',
            },
            {
                key: 'created',
                displayName: 'Skapad',
                getValue: (invoiceGroup: InvoiceGroup) =>
                    invoiceGroup.created ? formatDatetime(invoiceGroup.created) : '-',
                textTruncation: true,
                cellHideSize: 'xl',
                columnWidth: 170,
            },
            {
                key: 'actions',
                displayName: '',
                disableSort: true,
                getValue: () => '',
                getContentOverride: invoiceGroupActionsDisplayFn,
                cellHideSize: 'xl',
                columnWidth: 80,
            },
        ],
    };

    return (
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button onClick={() => setShowCreateModal(true)}>
                    <FontAwesomeIcon icon={faPlus} className="mr-1 fa-fw" /> Skapa Fakturaunderlagsgrupp
                </Button>
            </Header>
            <TableDisplay entities={invoiceGroups ?? []} configuration={{ ...tableSettings }} />
            <CreateInvoiceGroupModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                onCreate={createInvoiceGroup}
            />
            <ViewInvoiceGroupModal
                show={invoiceGroupToViewId !== null}
                onHide={() => setInvoiceGroupToViewId(null)}
                onMutate={() => mutate()}
                invoiceGroup={invoiceGroups?.find((x) => x.id === invoiceGroupToViewId)}
            />
        </Layout>
    );
};

export default InvoiceGroupPage;
