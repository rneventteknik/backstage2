import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import useSwr from 'swr';
import { formatDatetimeForForm } from '../../lib/datetimeUtils';
import { settingsFetcher } from '../../lib/fetchers';
import { toSetting } from '../../lib/mappers/setting';
import { useNotifications } from '../../lib/useNotifications';
import { getResponseContentOrError, updateItemsInArrayById } from '../../lib/utils';
import { Setting } from '../../models/interfaces';
import { ISettingObjectionModel } from '../../models/objection-models/SettingObjectionModel';
import { TableConfiguration, TableDisplay } from '../TableDisplay';
import ConfirmModal from '../utils/ConfirmModal';
import SettingsModal from '../utils/setting/SettingsModal';

const GeneralSettingsEditor: React.FC = () => {
    const { data: settings, error, isValidating, mutate } = useSwr('/api/setting', settingsFetcher);

    const [settingToEdit, setSettingToEdit] = useState<Setting | null>(null);
    const [settingToDelete, setSettingToDelete] = useState<Setting | null>(null);
    const [settingToAdd, setSettingToAdd] = useState<Partial<Setting> | null>(null);

    const {
        showDeleteSuccessNotification,
        showDeleteFailedNotification,
        showSaveFailedNotification,
        showSaveSuccessNotification,
    } = useNotifications();

    if (error) {
        return <p className="text-danger">{error.message}</p>;
    }

    if (isValidating || !settings) {
        return <Skeleton count={5} height={40} />;
    }

    const addSetting = async (setting: ISettingObjectionModel | null) => {
        if (!setting) {
            return;
        }
        const body = { setting: setting };
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        setSettingToAdd(null);

        fetch('/api/setting', request)
            .then((apiResponse) => getResponseContentOrError<ISettingObjectionModel>(apiResponse))
            .then(toSetting)
            .then((setting) => {
                mutate([...settings, setting], false);
                showSaveSuccessNotification('Inställningen');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Inställningen');
            });
    };

    const updateSetting = async (setting: Setting | null) => {
        if (!setting) {
            return;
        }
        const body = { setting: setting };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/setting/' + setting.id, request)
            .then((apiResponse) => getResponseContentOrError<ISettingObjectionModel>(apiResponse))
            .then(toSetting)
            .then((setting) => {
                mutate(updateItemsInArrayById(settings, setting), false);
                showSaveSuccessNotification('Inställningen');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Inställningen');
            });

        setSettingToEdit(null);
    };

    const deleteSetting = (setting: Setting | null) => {
        if (!setting) {
            return;
        }

        setSettingToDelete(null);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/setting/' + setting.id, request)
            .then(getResponseContentOrError)
            .then(() => {
                const filteredSetttings = settings.filter((x) => x.id !== setting.id);
                mutate(filteredSetttings, false);
                showDeleteSuccessNotification('Inställningen');
            })
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification('Inställningen');
            });
    };

    const SettingEntryActionsDisplayFn = (entry: Setting) => (
        <>
            <Button variant="dark" size="sm" onClick={() => setSettingToEdit(entry)} className="mr-2">
                Redigera
            </Button>
            <Button variant="danger" size="sm" onClick={() => setSettingToDelete(entry)}>
                Ta bort
            </Button>
        </>
    );

    // Table settings
    //
    const tableSettings: TableConfiguration<Setting> = {
        entityTypeDisplayName: '',
        hideTableFilter: true,
        hideTableCountControls: true,
        noResultsLabel: 'Listan är tom',
        defaultSortAscending: true,
        columns: [
            {
                key: 'Inställning',
                displayName: 'Key',
                getValue: (entry: Setting) => entry.key,
                columnWidth: 155,
            },
            {
                key: 'value',
                displayName: 'Värde',
                getValue: (entry: Setting) => entry.value,
                textTruncation: true,
                columnWidth: 175,
            },
            {
                key: 'note',
                displayName: 'Kommentar',
                getValue: (entry: Setting) => entry.note,
            },
            {
                key: 'updated',
                displayName: 'Senast ändrad',
                getValue: (entry: Setting) => formatDatetimeForForm(entry.updated),
                columnWidth: 125,
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                disableSort: true,
                getContentOverride: SettingEntryActionsDisplayFn,
                columnWidth: 175,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <>
            <TableDisplay entities={settings} configuration={tableSettings} />

            <div className="mb-4">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                        setSettingToAdd({ note: '', value: '' });
                    }}
                >
                    <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till inställning
                </Button>
            </div>

            <SettingsModal
                show={!!settingToAdd}
                hide={() => {
                    setSettingToAdd(null);
                }}
                onSubmit={() => {
                    const newSetting: ISettingObjectionModel = {
                        key: settingToAdd?.key ?? '',
                        value: settingToAdd?.value ?? '',
                        note: settingToAdd?.note ?? '',
                    };
                    addSetting(newSetting);
                }}
                onChange={setSettingToAdd}
                setting={settingToAdd}
            ></SettingsModal>

            <SettingsModal
                show={!!settingToEdit}
                hide={() => {
                    setSettingToEdit(null);
                }}
                onSubmit={() => {
                    updateSetting(settingToEdit);
                }}
                onChange={(setting) => {
                    if (!settingToEdit) {
                        return;
                    }
                    const editedSetting = {
                        id: settingToEdit.id,
                        key: setting.key ?? '',
                        value: setting.value ?? '',
                        note: setting.note ?? '',
                    };
                    setSettingToEdit(editedSetting);
                }}
                setting={settingToEdit}
            ></SettingsModal>

            <ConfirmModal
                title="Bekräfta"
                show={!!settingToDelete}
                onHide={() => setSettingToDelete(null)}
                confirmLabel="Ta bort"
                onConfirm={() => deleteSetting(settingToDelete)}
            >
                Vill du verkligen ta bort inställningen {settingToDelete?.key}?
            </ConfirmModal>
        </>
    );
};

export default GeneralSettingsEditor;
