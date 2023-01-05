import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import useSwr from 'swr';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { TableLoadingPage } from '../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../components/layout/ErrorPage';
import { IfNotReadonly } from '../components/utils/IfAdmin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faGears, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Setting } from '../models/interfaces';
import { TableConfiguration, TableDisplay } from '../components/TableDisplay';
import { getResponseContentOrError, updateItemsInArrayById } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { ISettingObjectionModel } from '../models/objection-models/SettingObjectionModel';
import { toSetting } from '../lib/mappers/setting';
import { Role } from '../models/enums/Role';
import SettingsModal from '../components/utils/setting/SettingsModal';
import ConfirmModal from '../components/utils/ConfirmModal';
import { settingsFetcher } from '../lib/fetchers';
import { formatDate } from '../lib/datetimeUtils';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.ADMIN);
type Props = { user: CurrentUserInfo };
const pageTitle = 'Inställningar';
const breadcrumbs = [{ link: 'setting', displayName: pageTitle }];

const SettingListPage: React.FC<Props> = ({ user: currentUser }: Props) => {
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
        return <ErrorPage errorMessage={error} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !settings) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} />;
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
        <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm" disabled={false}>
            <Dropdown.Item onClick={() => setSettingToEdit(entry)}>
                <FontAwesomeIcon icon={faGears} className="mr-1 fa-fw" /> Redigera
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSettingToDelete(entry)} className="text-danger">
                <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort rad
            </Dropdown.Item>
        </DropdownButton>
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
                columnWidth: 100,
            },
            {
                key: 'value',
                displayName: 'Värde',
                getValue: (entry: Setting) => entry.value,
                columnWidth: 100,
            },
            {
                key: 'note',
                displayName: 'Kommentar',
                getValue: (entry: Setting) => entry.note,
                columnWidth: 180,
            },
            {
                key: 'updated',
                displayName: 'Senast ändrad',
                getValue: (entry: Setting) => formatDate(entry.updated),
                columnWidth: 50,
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                disableSort: true,
                getContentOverride: SettingEntryActionsDisplayFn,
                columnWidth: 10,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <>
            <Layout title={pageTitle} currentUser={currentUser}>
                <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                    <IfNotReadonly currentUser={currentUser}>
                        <Button
                            variant="primary"
                            as="span"
                            onClick={() => {
                                setSettingToAdd({ note: '', value: '' });
                            }}
                        >
                            <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till inställning
                        </Button>
                    </IfNotReadonly>
                </Header>
                <TableDisplay entities={settings} configuration={tableSettings} />
            </Layout>

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

export default SettingListPage;
