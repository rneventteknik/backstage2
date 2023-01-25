import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import { getResponseContentOrError, updateItemsInArrayById } from '../../lib/utils';
import { BaseEntityWithName, HasId } from '../../models/interfaces/BaseEntity';
import { useNotifications } from '../../lib/useNotifications';
import { Button, Modal } from 'react-bootstrap';
import useSwr from 'swr';
import ConfirmModal from '../utils/ConfirmModal';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDatetimeForForm } from '../../lib/datetimeUtils';
import { HasSortIndex, sortIndexSortFn } from '../../lib/sortIndexUtils';

type Props<T extends BaseEntityWithName> = {
    fetcher: (s: string) => Promise<T[]>;
    apiUrl: string;
    entityName: string;
    entityDisplayName: string;
    getEditComponent: (x: T, save: (x: T) => void) => React.ReactElement;
    sortBySortIndex?: boolean;
};

const BaseEntityWithNamesEditor = <T extends BaseEntityWithName>({
    apiUrl,
    entityName,
    entityDisplayName,
    fetcher,
    getEditComponent,
    sortBySortIndex = false,
}: Props<T>): React.ReactElement => {
    const { data, mutate, error, isValidating } = useSwr(apiUrl, fetcher);
    const [entityToDelete, setEntityToDelete] = useState<T | null>(null);
    const [entityToEdit, setEntityToEdit] = useState<T | null>(null);
    const {
        showSaveSuccessNotification,
        showDeleteSuccessNotification,
        showDeleteFailedNotification,
        showSaveFailedNotification,
    } = useNotifications();

    if (error) {
        return <p className="text-danger">{error.message}</p>;
    }

    if (isValidating || !data) {
        return <Skeleton count={5} height={40} />;
    }

    const updateEntity = (entity: T | null) => {
        if (!entity) {
            return;
        }

        const body = { [entityName]: entity };
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        fetch(apiUrl + '/' + entity.id, request)
            .then((apiResponse) => getResponseContentOrError<unknown>(apiResponse))
            .then(() => {
                showSaveSuccessNotification(entityDisplayName);
                const updatedList = updateItemsInArrayById(data, entity);
                mutate(updatedList, false);
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification(entityDisplayName);
            });
    };

    const insertEntity = (entity: T | null) => {
        if (!entity) {
            return;
        }

        const body = { [entityName]: entity };
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        fetch(apiUrl, request)
            .then((apiResponse) => getResponseContentOrError<unknown>(apiResponse))
            .then(() => {
                showSaveSuccessNotification(entityDisplayName);
                const updatedList = [...data, entity];
                mutate(updatedList, false);
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification(entityDisplayName);
            });
    };

    const deleteEntity = (entity: BaseEntityWithName | null) => {
        if (!entity) {
            return;
        }

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch(apiUrl + '/' + entity.id, request)
            .then(getResponseContentOrError)
            .then(() => {
                showDeleteSuccessNotification(entityDisplayName);
                const updatedList = data.filter((x) => x.id != entity.id);
                mutate(updatedList, false);
            })
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification(entityDisplayName);
            });
    };

    const actionsDisplayFn = (entity: T) => (
        <>
            <Button
                variant="dark"
                size="sm"
                onClick={() => {
                    setEntityToEdit({ ...entity });
                }}
                className="mr-2"
            >
                Redigera
            </Button>
            <Button
                variant="danger"
                size="sm"
                onClick={() => {
                    setEntityToDelete(entity);
                }}
            >
                Ta bort
            </Button>
        </>
    );

    const tableSettings: TableConfiguration<T> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        customSortFn: sortBySortIndex
            ? (a: T, b: T) =>
                  sortIndexSortFn(a as unknown as HasSortIndex & HasId, b as unknown as HasSortIndex & HasId)
            : undefined,
        hideTableFilter: true,
        hideTableCountControls: true,
        columns: [
            {
                key: 'name',
                displayName: entityDisplayName,
                getValue: (model: T) => model.name,
            },
            {
                key: 'updated',
                displayName: 'Senast ändrad',
                getValue: (entry: T) => formatDatetimeForForm(entry.updated),
                columnWidth: 125,
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                disableSort: true,
                getContentOverride: actionsDisplayFn,
                columnWidth: 175,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <>
            <TableDisplay entities={data} configuration={tableSettings} />

            <div className="mb-4">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                        setEntityToEdit({} as T);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" /> Lägg till
                </Button>
            </div>

            <ConfirmModal
                show={entityToDelete !== null}
                onHide={() => setEntityToDelete(null)}
                onConfirm={() => {
                    deleteEntity(entityToDelete);
                    setEntityToDelete(null);
                }}
                title="Bekräfta"
                confirmLabel="Ta bort"
            >
                Vill du verkligen ta bort {entityToDelete?.name}?
            </ConfirmModal>

            <Modal show={entityToEdit !== null} onHide={() => setEntityToEdit(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Redigera {entityToEdit?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{entityToEdit ? getEditComponent(entityToEdit, setEntityToEdit) : null}</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (entityToEdit && entityToEdit.id) {
                                entityToEdit.updated = new Date();
                                updateEntity(entityToEdit);
                            } else {
                                insertEntity(entityToEdit);
                            }

                            setEntityToEdit(null);
                        }}
                    >
                        Spara
                    </Button>
                    <Button variant="secondary" onClick={() => setEntityToEdit(null)}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BaseEntityWithNamesEditor;
