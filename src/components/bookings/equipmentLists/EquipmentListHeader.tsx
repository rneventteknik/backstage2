import React, { useState } from 'react';
import { Button, Col, Dropdown, DropdownButton, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faAngleUp,
    faEraser,
    faTrashCan,
    faBackward,
    faBarsStaggered,
    faCalendarDays,
    faClone,
    faPlus,
    faRightFromBracket,
    faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { toIntOrUndefined, getRentalStatusName } from '../../../lib/utils';
import { DoubleClickToEdit, DoubleClickToEditDatetime } from '../../utils/DoubleClickToEdit';
import { formatNumberAsCurrency, getEquipmentListPrice } from '../../../lib/pricingUtils';
import { PricePlan } from '../../../models/enums/PricePlan';
import {
    formatDatetime,
    getEquipmentInDatetime,
    getEquipmentOutDatetime,
    getNumberOfDays,
    getNumberOfEquipmentOutDays,
} from '../../../lib/datetimeUtils';
import { Language } from '../../../models/enums/Language';
import { addHeadingEntry, importEquipmentEntries } from '../../../lib/equipmentListUtils';
import { BookingType } from '../../../models/enums/BookingType';
import { RentalStatus } from '../../../models/enums/RentalStatus';
import { Status } from '../../../models/enums/Status';
import ConfirmModal from '../../utils/ConfirmModal';
import BookingReturnalNoteModal from '../BookingReturnalNoteModal';
import CopyEquipmentListEntriesModal from './CopyEquipmentListEntriesModal';
import { useNotifications } from '../../../lib/useNotifications';

type Props = {
    list: EquipmentList;
    pricePlan: PricePlan;
    language: Language;
    bookingStatus: Status;
    bookingType: BookingType;
    returnalNote: string | undefined;
    showListContent: boolean;
    saveList: (updatedList: EquipmentList) => void;
    deleteList: () => void;
    editEntry: (entry: Partial<EquipmentListEntry>) => void;
    saveReturnalNote: (returnalNote: string) => void;
    toggleListContent: () => void;
    moveListUp: () => void;
    moveListDown: () => void;
    disableMoveUp: boolean;
    disableMoveDown: boolean;
    readonly: boolean;
};

const EquipmentListHeader: React.FC<Props> = ({
    list,
    pricePlan,
    language,
    bookingStatus,
    bookingType,
    returnalNote,
    showListContent,
    saveList,
    deleteList,
    editEntry,
    saveReturnalNote,
    toggleListContent,
    moveListUp,
    moveListDown,
    disableMoveUp,
    disableMoveDown,
    readonly,
}: Props) => {
    const [showEmptyListModal, setShowEmptyListModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReturnalNoteModal, setShowReturnalNoteModal] = useState(false);
    const [showResetDatesModal, setShowResetDatesModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const { showErrorMessage } = useNotifications();

    // Consts to control which date edit components are shown (i.e. interval, dates or both). Note that
    // the logic for usage dates and in/out dates are seperated.
    const showIntervalControls = list.numberOfDays !== null && list.numberOfDays !== undefined;
    const showDateControls =
        list.numberOfDays === null ||
        list.numberOfDays === undefined ||
        list.usageStartDatetime ||
        list.usageEndDatetime ||
        list.equipmentOutDatetime ||
        list.equipmentInDatetime;

    // Verify that start dates are before end dates, and if ok, then save the list. Otherwise show an eror and return.
    const verifyTimesAndSaveList = (updatedList: EquipmentList) => {
        if (
            updatedList.usageStartDatetime &&
            updatedList.usageEndDatetime &&
            updatedList.usageStartDatetime.getTime() >= updatedList.usageEndDatetime.getTime()
        ) {
            showErrorMessage('Starttid måste vara innan sluttid');
            return;
        }

        const equipmentInDatetime = getEquipmentInDatetime(updatedList);
        const equipmentOutDatetime = getEquipmentOutDatetime(updatedList);

        if (
            equipmentOutDatetime &&
            equipmentInDatetime &&
            equipmentOutDatetime.getTime() >= equipmentInDatetime.getTime()
        ) {
            showErrorMessage('Utlämning måste vara innan återlämning');
            return;
        }
        saveList(updatedList);
    };

    // HTML template
    //
    return (
        <>
            <div className="d-flex">
                <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                    <DoubleClickToEdit
                        value={list.name}
                        onUpdate={(newValue: string) =>
                            saveList({ ...list, name: newValue && newValue.length > 0 ? newValue : list.name })
                        }
                        readonly={readonly}
                    >
                        {list.name}
                    </DoubleClickToEdit>
                </div>
                <div className="d-flex">
                    <Button className="mr-2" variant="" onClick={() => toggleListContent()}>
                        <FontAwesomeIcon icon={showListContent ? faAngleUp : faAngleDown} />
                    </Button>
                    {readonly ? null : (
                        <>
                            {bookingType === BookingType.RENTAL && list.rentalStatus == undefined ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => saveList({ ...list, rentalStatus: RentalStatus.OUT })}
                                    className="mr-2"
                                >
                                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-1" /> Lämna ut
                                </Button>
                            ) : null}

                            {bookingType === BookingType.RENTAL && list.rentalStatus == RentalStatus.OUT ? (
                                <>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowReturnalNoteModal(true)}
                                        className="mr-2"
                                    >
                                        <FontAwesomeIcon icon={faRightToBracket} className="mr-1" /> Ta emot
                                    </Button>
                                    <BookingReturnalNoteModal
                                        returnalNote={returnalNote}
                                        onSubmit={(returnalNote) => {
                                            saveReturnalNote(returnalNote);
                                            saveList({ ...list, rentalStatus: RentalStatus.RETURNED });
                                        }}
                                        hide={() => setShowReturnalNoteModal(false)}
                                        show={showReturnalNoteModal}
                                    />
                                </>
                            ) : null}

                            <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                                <Dropdown.Item onClick={() => moveListUp()} disabled={disableMoveUp}>
                                    <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => moveListDown()} disabled={disableMoveDown}>
                                    <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() =>
                                        editEntry({
                                            numberOfUnits: 1,
                                            numberOfHours: 0,
                                        })
                                    }
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-1 fa-fw" />
                                    Lägg till egen rad
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => addHeadingEntry('Ny rubrikrad', list, pricePlan, language, saveList)}
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-1 fa-fw" />
                                    Lägg till rubrikrad
                                </Dropdown.Item>
                                {list.numberOfDays === null ? (
                                    bookingStatus === Status.DRAFT ? (
                                        <>
                                            <Dropdown.Item onClick={() => setShowResetDatesModal(true)}>
                                                <FontAwesomeIcon icon={faBarsStaggered} className="mr-1 fa-fw" />
                                                Ange endast antal dagar
                                            </Dropdown.Item>
                                            <ConfirmModal
                                                show={showResetDatesModal}
                                                onHide={() => setShowResetDatesModal(false)}
                                                onConfirm={() => {
                                                    setShowResetDatesModal(false);
                                                    saveList({
                                                        ...list,
                                                        numberOfDays: getNumberOfDays(list) ?? 1,
                                                        usageStartDatetime: null,
                                                        usageEndDatetime: null,
                                                        equipmentInDatetime: null,
                                                        equipmentOutDatetime: null,
                                                    });
                                                }}
                                                title="Bekräfta"
                                            >
                                                Vill du verkligen ta bort datumen från listan {list.name}?
                                            </ConfirmModal>
                                        </>
                                    ) : null
                                ) : (
                                    <Dropdown.Item
                                        onClick={() =>
                                            saveList({
                                                ...list,
                                                numberOfDays: null,
                                                usageStartDatetime: null,
                                                usageEndDatetime: null,
                                                equipmentInDatetime: null,
                                                equipmentOutDatetime: null,
                                            })
                                        }
                                    >
                                        <FontAwesomeIcon icon={faCalendarDays} className="mr-1 fa-fw" />
                                        Sätt datum
                                    </Dropdown.Item>
                                )}
                                {bookingType === BookingType.RENTAL ? (
                                    <Dropdown.Item
                                        onClick={() => saveList({ ...list, rentalStatus: null })}
                                        disabled={list.rentalStatus == undefined}
                                    >
                                        <FontAwesomeIcon icon={faBackward} className="mr-1 fa-fw" />
                                        Återställ utlämningsstatus
                                    </Dropdown.Item>
                                ) : null}

                                <Dropdown.Item onClick={() => setShowImportModal(true)}>
                                    <FontAwesomeIcon icon={faClone} className="mr-1 fa-fw" /> Hämta utrustning från
                                    bokning
                                </Dropdown.Item>
                                <CopyEquipmentListEntriesModal
                                    show={showImportModal}
                                    onHide={() => setShowImportModal(false)}
                                    onImport={(listEntries, listHeadings) =>
                                        importEquipmentEntries(listEntries, listHeadings, list, saveList)
                                    }
                                    pricePlan={pricePlan}
                                    language={language}
                                />

                                <Dropdown.Item onClick={() => setShowEmptyListModal(true)}>
                                    <FontAwesomeIcon icon={faEraser} className="mr-1 fa-fw" /> Töm utrustningslistan
                                </Dropdown.Item>
                                <ConfirmModal
                                    show={showEmptyListModal}
                                    onHide={() => setShowEmptyListModal(false)}
                                    confirmLabel="Töm listan"
                                    onConfirm={() => {
                                        setShowEmptyListModal(false);
                                        saveList({ ...list, listEntries: [], listHeadings: [] });
                                    }}
                                    title="Bekräfta"
                                >
                                    Vill du verkligen tömma listan {list.name}?
                                </ConfirmModal>

                                <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                                    <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort
                                    utrustningslistan
                                </Dropdown.Item>
                                <ConfirmModal
                                    show={showDeleteModal}
                                    onHide={() => setShowDeleteModal(false)}
                                    confirmLabel="Ta bort"
                                    onConfirm={() => {
                                        setShowDeleteModal(false);
                                        deleteList();
                                    }}
                                    title="Bekräfta"
                                >
                                    Vill du verkligen ta bort listan {list.name}?
                                </ConfirmModal>
                            </DropdownButton>
                        </>
                    )}
                </div>
            </div>
            <p className="text-muted">
                {list.listEntries.length} rader / {formatNumberAsCurrency(getEquipmentListPrice(list))}
                {getNumberOfDays(list) && getNumberOfEquipmentOutDays(list) ? (
                    <>
                        {' '}
                        / {getNumberOfEquipmentOutDays(list)} dagar / {getNumberOfDays(list)} debiterade dagar
                    </>
                ) : null}
                {bookingType === BookingType.RENTAL ? <> / {getRentalStatusName(list.rentalStatus)}</> : null}
            </p>
            {showIntervalControls ? (
                <>
                    <small>Antal dagar</small>
                    <div className="d-flex">
                        <div className="flex-grow-1">
                            <div className="mb-3" style={{ fontSize: '1.2em' }}>
                                <DoubleClickToEdit
                                    value={list.numberOfDays?.toString()}
                                    inputType="number"
                                    onUpdate={(newValue) =>
                                        saveList({
                                            ...list,
                                            numberOfDays: toIntOrUndefined(newValue) ?? 1,
                                        })
                                    }
                                    readonly={readonly}
                                    className="mb-3 d-block"
                                >
                                    {list.numberOfDays} {list.numberOfDays != 1 ? 'dagar' : 'dag'}
                                </DoubleClickToEdit>
                            </div>
                        </div>
                        <div>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    saveList({
                                        ...list,
                                        numberOfDays: null,
                                        usageStartDatetime: null,
                                        usageEndDatetime: null,
                                        equipmentInDatetime: null,
                                        equipmentOutDatetime: null,
                                    })
                                }
                                className="mr-2"
                            >
                                <FontAwesomeIcon icon={faCalendarDays} className="mr-1 fa-fw" />
                                Sätt datum
                            </Button>
                        </div>
                    </div>
                </>
            ) : null}
            {showDateControls ? (
                <Row>
                    <Col md={3} xs={6}>
                        <small>Debiterad starttid</small>
                        <div style={{ fontSize: '1.2em' }}>
                            <DoubleClickToEditDatetime
                                value={list.usageStartDatetime}
                                onUpdate={(newValue) =>
                                    verifyTimesAndSaveList({ ...list, usageStartDatetime: newValue ?? null })
                                }
                                max={list.usageEndDatetime
                                    ?.toISOString()
                                    .substring(0, list.usageEndDatetime?.toISOString().indexOf('T') + 6)}
                                readonly={readonly}
                                className="d-block"
                            />
                        </div>
                    </Col>
                    <Col md={3} xs={6}>
                        <small>Debiterad sluttid</small>
                        <div style={{ fontSize: '1.2em' }}>
                            <DoubleClickToEditDatetime
                                value={list.usageEndDatetime}
                                onUpdate={(newValue) =>
                                    verifyTimesAndSaveList({ ...list, usageEndDatetime: newValue ?? null })
                                }
                                min={list.usageStartDatetime
                                    ?.toISOString()
                                    .substring(0, list.usageStartDatetime?.toISOString().indexOf('T') + 6)}
                                readonly={readonly}
                                className="d-block"
                            />
                        </div>
                    </Col>
                    <Col md={3} xs={6}>
                        <small>Utlämning</small>
                        <div style={{ fontSize: '1.2em' }}>
                            <DoubleClickToEditDatetime
                                value={list.equipmentOutDatetime}
                                onUpdate={(newValue) =>
                                    verifyTimesAndSaveList({ ...list, equipmentOutDatetime: newValue ?? null })
                                }
                                max={getEquipmentInDatetime(list)
                                    ?.toISOString()
                                    .substring(0, (getEquipmentInDatetime(list)?.toISOString()?.indexOf('T') ?? 0) + 6)}
                                readonly={readonly}
                                placeholder={formatDatetime(list.usageStartDatetime, 'N/A')}
                            />
                        </div>
                    </Col>
                    <Col md={3} xs={6}>
                        <small>Återlämning</small>
                        <div style={{ fontSize: '1.2em' }}>
                            <DoubleClickToEditDatetime
                                value={list.equipmentInDatetime}
                                onUpdate={(newValue) =>
                                    verifyTimesAndSaveList({ ...list, equipmentInDatetime: newValue ?? null })
                                }
                                min={getEquipmentOutDatetime(list)
                                    ?.toISOString()
                                    .substring(
                                        0,
                                        (getEquipmentOutDatetime(list)?.toISOString()?.indexOf('T') ?? 0) + 6,
                                    )}
                                readonly={readonly}
                                placeholder={formatDatetime(list.usageEndDatetime, 'N/A')}
                            />
                        </div>
                    </Col>
                </Row>
            ) : null}
        </>
    );
};

export default EquipmentListHeader;
