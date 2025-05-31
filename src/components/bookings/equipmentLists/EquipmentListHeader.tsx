import React, { useState } from 'react';
import { Alert, Button, Col, Dropdown, DropdownButton, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
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
    faFileDownload,
    faPercent,
    faListCheck,
    faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry, EquipmentListHeading } from '../../../models/interfaces/EquipmentList';
import { toIntOrUndefined, getRentalStatusName } from '../../../lib/utils';
import { ClickToEdit } from '../../utils/DoubleClickToEdit';
import { addVAT, formatCurrency, getEquipmentListPrice } from '../../../lib/pricingUtils';
import { PricePlan } from '../../../models/enums/PricePlan';
import {
    formatDatetime,
    formatDatetimeForForm,
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
import EditEquipmentListDatesModal from './EditEquipmentListDatesModal';
import EditTextModal from '../../utils/EditTextModal';
import Link from 'next/link';

type Props = {
    list: EquipmentList;
    bookingId: number;
    pricePlan: PricePlan;
    language: Language;
    bookingStatus: Status;
    bookingType: BookingType;
    returnalNote: string | undefined;
    showListContent: boolean;
    saveList: (updatedList: EquipmentList) => void;
    addListHeading: (heading: EquipmentListHeading, listId: number) => void;
    addListEntriesAndHeadings: (
        entries: EquipmentListEntry[],
        headings: EquipmentListHeading[],
        listId: number,
    ) => void;
    deleteList: () => void;
    editEntry: (entry: Partial<EquipmentListEntry>) => void;
    saveReturnalNote: (returnalNote: string) => void;
    toggleListContent: () => void;
    moveListUp: () => void;
    moveListDown: () => void;
    disableMoveUp: boolean;
    disableMoveDown: boolean;
    disableDelete: boolean;
    readonly: boolean;
};

const EquipmentListHeader: React.FC<Props> = ({
    list,
    bookingId,
    pricePlan,
    language,
    bookingStatus,
    bookingType,
    returnalNote,
    showListContent,
    saveList,
    addListHeading,
    addListEntriesAndHeadings,
    deleteList,
    editEntry,
    saveReturnalNote,
    toggleListContent,
    moveListUp,
    moveListDown,
    disableMoveUp,
    disableMoveDown,
    disableDelete,
    readonly,
}: Props) => {
    const [showEmptyListModal, setShowEmptyListModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConfirmOutModal, setShowConfirmOutModal] = useState(false);
    const [showReturnalNoteModal, setShowReturnalNoteModal] = useState(false);
    const [showResetDatesModal, setShowResetDatesModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showEditDatesModal, setShowEditDatesModal] = useState(false);
    const [showEditDiscountPercentageModal, setShowEditDiscountPercentageModal] = useState(false);

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

    const showEquipmentDateWarning = (list: EquipmentList) =>
        bookingStatus === Status.BOOKED && bookingType == BookingType.RENTAL && !list.equipmentOutDatetime;

    const getEquipmentDateColor = (list: EquipmentList) => {
        if (!!list.equipmentOutDatetime) {
            return '';
        }

        if (showEquipmentDateWarning(list)) {
            return 'text-danger';
        }

        return 'text-muted';
    };

    // HTML template
    //
    return (
        <>
            <div className="d-flex">
                <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                    <ClickToEdit
                        value={list.name}
                        onUpdate={(newValue: string) =>
                            saveList({
                                ...list,
                                name: newValue && newValue.trim().length > 0 ? newValue.trim() : list.name,
                            })
                        }
                        readonly={readonly}
                    >
                        {list.name}
                    </ClickToEdit>
                </div>
                <div className="d-flex">
                    <Button className="mr-2" variant="" onClick={() => toggleListContent()}>
                        <FontAwesomeIcon icon={showListContent ? faAngleUp : faAngleDown} />
                    </Button>
                    {readonly ? null : (
                        <>
                            {bookingType === BookingType.RENTAL && list.rentalStatus == undefined ? (
                                <>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowConfirmOutModal(true)}
                                        className="mr-2"
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket} className="mr-1" /> Lämna ut
                                    </Button>
                                    <ConfirmModal
                                        show={showConfirmOutModal}
                                        onHide={() => setShowConfirmOutModal(false)}
                                        onConfirm={() => {
                                            saveList({ ...list, rentalStatus: RentalStatus.OUT });
                                            setShowConfirmOutModal(false);
                                        }}
                                        title="Bekräfta"
                                        confirmLabel="Lämna ut"
                                        confirmButtonType="primary"
                                    >
                                        {bookingStatus === Status.DRAFT ? (
                                            <Alert variant="danger">
                                                Är du säker på att du vill lämna ut utrustningslistan {list.name} trots
                                                att bokningen är ett utkast? Utrustningslistor som lämnas ut bör höra
                                                till bokningar som är bokade.
                                            </Alert>
                                        ) : (
                                            <>Är du säker på att du vill lämna ut bokningen {list.name}?</>
                                        )}
                                    </ConfirmModal>
                                </>
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

                                <Dropdown.Divider />

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
                                    onClick={() =>
                                        addHeadingEntry('Ny rubrikrad', list, pricePlan, language, addListHeading)
                                    }
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-1 fa-fw" />
                                    Lägg till rubrikrad
                                </Dropdown.Item>

                                <Dropdown.Item onClick={() => setShowImportModal(true)}>
                                    <FontAwesomeIcon icon={faClone} className="mr-1 fa-fw" />
                                    Hämta utrustning från bokning
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => setShowEditDiscountPercentageModal(true)}>
                                    <FontAwesomeIcon icon={faPercent} className="mr-1 fa-fw" /> Redigera rabatt
                                </Dropdown.Item>
                                {showEditDiscountPercentageModal ? (
                                    <EditTextModal
                                        text={list.discountPercentage.toString()}
                                        onSubmit={(newDiscountPercentage) => {
                                            saveList({
                                                ...list,
                                                discountPercentage: Math.min(
                                                    100,
                                                    Math.max(0, parseInt(newDiscountPercentage)),
                                                ),
                                            });
                                            setShowEditDiscountPercentageModal(false);
                                        }}
                                        hide={() => setShowEditDiscountPercentageModal(false)}
                                        show={showEditDiscountPercentageModal}
                                        modalTitle={'Redigera rabatt'}
                                        modalConfirmText={'Spara'}
                                        modalSize="sm"
                                        textarea={false}
                                        textFieldSuffix="%"
                                        textIsValid={(text) => !isNaN(parseInt(text))}
                                    />
                                ) : null}
                                <CopyEquipmentListEntriesModal
                                    show={showImportModal}
                                    onHide={() => setShowImportModal(false)}
                                    onImport={(listEntries, listHeadings) =>
                                        importEquipmentEntries(
                                            listEntries,
                                            listHeadings,
                                            list,
                                            addListEntriesAndHeadings,
                                        )
                                    }
                                    pricePlan={pricePlan}
                                    language={language}
                                />

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

                                <Dropdown.Divider />

                                <Link href={'/bookings/' + bookingId + '/equipmentList/' + list.id} passHref>
                                    <Dropdown.Item href={'/bookings/' + bookingId + '/equipmentList/' + list.id}>
                                        <FontAwesomeIcon icon={faListCheck} className="mr-1 fa-fw" /> Visa som packlista
                                    </Dropdown.Item>
                                </Link>

                                <Dropdown.Item
                                    href={'/api/documents/packing-list/sv/' + bookingId + '?list=' + list.id}
                                    target="_blank"
                                >
                                    <FontAwesomeIcon icon={faFileDownload} className="mr-1 fa-fw" /> Ladda ner packlista
                                </Dropdown.Item>

                                <Dropdown.Divider />

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

                                {!disableDelete ? (
                                    <>
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
                                    </>
                                ) : null}
                            </DropdownButton>
                        </>
                    )}
                </div>
            </div>
            <p className="text-muted">
                {formatCurrency(addVAT(getEquipmentListPrice(list)))}
                {getNumberOfDays(list) && getNumberOfEquipmentOutDays(list) ? (
                    <>
                        {' '}
                        / {getNumberOfEquipmentOutDays(list)} dagar / {getNumberOfDays(list)} debiterade dagar
                    </>
                ) : null}
                {bookingType === BookingType.RENTAL ? <> / {getRentalStatusName(list.rentalStatus)}</> : null}
                {list.discountPercentage !== 0 ? (
                    <>
                        {' '}
                        / <span className="text-danger">{list.discountPercentage}% rabatt</span>
                    </>
                ) : null}
            </p>
            {showIntervalControls ? (
                <>
                    <small>Antal dagar</small>
                    <div className="d-flex">
                        <div className="flex-grow-1">
                            <div className="mb-3" style={{ fontSize: '1.2em' }}>
                                <ClickToEdit
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
                                </ClickToEdit>
                            </div>
                        </div>
                        {readonly ? null : (
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
                        )}
                    </div>
                </>
            ) : null}
            {showDateControls ? (
                <>
                    {showEditDatesModal ? (
                        <EditEquipmentListDatesModal
                            show={showEditDatesModal}
                            onHide={() => setShowEditDatesModal(false)}
                            equipmentList={list}
                            onSave={(e) => {
                                setShowEditDatesModal(false);
                                saveList(e);
                            }}
                        />
                    ) : null}
                    <Row
                        onClick={() => (readonly ? null : setShowEditDatesModal(true))}
                        role={readonly ? undefined : 'button'}
                    >
                        <Col md={3} xs={6}>
                            <small>Debiterad starttid</small>
                            <div
                                className="mb-3"
                                style={{ fontSize: '1.2em' }}
                                title={formatDatetimeForForm(list.usageStartDatetime)}
                            >
                                {formatDatetime(list.usageStartDatetime)}
                            </div>
                        </Col>
                        <Col md={3} xs={6}>
                            <small>Debiterad sluttid</small>
                            <div
                                className="mb-3"
                                style={{ fontSize: '1.2em' }}
                                title={formatDatetimeForForm(list.usageEndDatetime)}
                            >
                                {formatDatetime(list.usageEndDatetime)}
                            </div>
                        </Col>
                        <Col md={3} xs={6}>
                            <small>
                                Utlämning
                                {showEquipmentDateWarning(list) ? (
                                    <OverlayTrigger
                                        placement="right"
                                        overlay={
                                            <Tooltip id="1">
                                                <strong>
                                                    Denna utrustningslista saknar explicit datum för utlämning.
                                                </strong>
                                            </Tooltip>
                                        }
                                    >
                                        <FontAwesomeIcon icon={faWarning} className="ml-1" />
                                    </OverlayTrigger>
                                ) : null}
                            </small>
                            <div
                                className={'mb-3 ' + getEquipmentDateColor(list)}
                                style={{ fontSize: '1.2em' }}
                                title={formatDatetimeForForm(getEquipmentOutDatetime(list))}
                            >
                                {formatDatetime(getEquipmentOutDatetime(list))}
                            </div>
                        </Col>
                        <Col md={3} xs={6}>
                            <small>
                                Återlämning
                                {showEquipmentDateWarning(list) ? (
                                    <OverlayTrigger
                                        placement="right"
                                        overlay={
                                            <Tooltip id="2">
                                                <strong>
                                                    Denna utrustningslista saknar explicit datum för återlämning.
                                                </strong>
                                            </Tooltip>
                                        }
                                    >
                                        <FontAwesomeIcon icon={faWarning} className="ml-1" />
                                    </OverlayTrigger>
                                ) : null}
                            </small>
                            <div
                                className={'mb-3 ' + getEquipmentDateColor(list)}
                                style={{ fontSize: '1.2em' }}
                                title={formatDatetimeForForm(getEquipmentInDatetime(list))}
                            >
                                {formatDatetime(getEquipmentInDatetime(list))}
                            </div>
                        </Col>
                    </Row>
                </>
            ) : null}
        </>
    );
};

export default EquipmentListHeader;
