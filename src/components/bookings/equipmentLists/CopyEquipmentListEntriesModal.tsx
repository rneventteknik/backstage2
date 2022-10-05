import React, { useState } from 'react';
import { Badge, Button, Card, Form, Modal, OverlayTrigger, Tab, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faSync } from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { useNotifications } from '../../../lib/useNotifications';
import BookingSearch from '../../BookingSearch';
import { getResponseContentOrError, toIntOrUndefined } from '../../../lib/utils';
import { toBooking } from '../../../lib/mappers/booking';
import { IBookingObjectionModel } from '../../../models/objection-models';
import { getSortedList, sortIndexSortFn } from '../../../lib/sortIndexUtils';
import { formatNumberAsCurrency, formatPrice } from '../../../lib/pricingUtils';
import { Booking, Equipment, EquipmentPrice } from '../../../models/interfaces';
import { PricePlan } from '../../../models/enums/PricePlan';
import { TableConfiguration, TableDisplay } from '../../TableDisplay';
import { Language } from '../../../models/enums/Language';

type Props = {
    show: boolean;
    onHide: () => void;
    onImport: (listEntries: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'>[]) => void;
    pricePlan: PricePlan | undefined;
    language: Language | undefined;
};

const CopyEquipmentListEntriesModal: React.FC<Props> = ({ show, onHide, onImport, pricePlan, language }: Props) => {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedEquipmentList, setSelectedEquipmentList] = useState<EquipmentList | null>(null);
    const [selectedEquipmentListEntryIds, setSelectedEquipmentListEntryIds] = useState<number[]>([]);
    const [resetNames, setResetNames] = useState<boolean>(true);
    const [resetPrices, setResetPrices] = useState<boolean>(true);
    const [resetManualPrices, setResetManualPrices] = useState<boolean>(true);

    const { showErrorMessage } = useNotifications();

    const selectBooking = (bookingId: number) => {
        setSelectedEquipmentList(null);
        setSelectedEquipmentListEntryIds([]);

        const request = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/bookings/' + bookingId, request)
            .then((response) => getResponseContentOrError<IBookingObjectionModel>(response))
            .then(toBooking)
            .then((booking) => {
                setSelectedBooking(booking);

                if (booking.equipmentLists && booking.equipmentLists.length === 1) {
                    setSelectedEquipmentList(booking.equipmentLists[0]);
                }
            })
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Sökningen misslyckades');
            });
    };

    const toggleEquipmentListEntrySelection = (entry: EquipmentListEntry) => {
        if (entry.equipment?.isArchived) {
            return;
        }

        const checked = selectedEquipmentListEntryIds.some((x) => x === entry.id);

        setSelectedEquipmentListEntryIds(
            checked
                ? selectedEquipmentListEntryIds.filter((x) => x !== entry.id)
                : [...selectedEquipmentListEntryIds, entry.id],
        );
    };

    const importEquipment = () => {
        const listEntries = getSortedList(selectedEquipmentList?.listEntries ?? [])
            .filter((x) => selectedEquipmentListEntryIds.some((id) => x.id === id))
            .map((x) => {
                const entry: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'> = {
                    equipmentId: x.equipmentId,
                    equipment: x.equipment,
                    equipmentPrice: x.equipmentPrice,
                    numberOfUnits: x.numberOfUnits,
                    numberOfHours: x.numberOfHours,
                    discount: x.discount,

                    name: x.name,
                    description: x.description,

                    pricePerHour: x.pricePerHour,
                    pricePerUnit: x.pricePerUnit,
                    isHidden: x.isHidden,
                };

                if (resetNames && x.equipment) {
                    entry.name = getEquipmentName(x.equipment) ?? '';
                    entry.description = getEquipmentDescription(x.equipment) ?? '';
                }

                if (resetPrices) {
                    if (x.equipmentPrice) {
                        entry.pricePerUnit = getEquipmentListEntryPrices(x.equipmentPrice).pricePerUnit;
                        entry.pricePerHour = getEquipmentListEntryPrices(x.equipmentPrice).pricePerHour;
                    } else if (resetManualPrices && x.equipment && x.equipment.prices.length > 0) {
                        entry.pricePerUnit = getEquipmentListEntryPrices(x.equipment.prices[0]).pricePerUnit;
                        entry.pricePerHour = getEquipmentListEntryPrices(x.equipment.prices[0]).pricePerHour;
                    }
                }

                return entry;
            });

        onImport(listEntries);

        resetAndHide();
    };

    const resetAndHide = () => {
        onHide();
        setSelectedEquipmentListEntryIds([]);
        setSelectedEquipmentList(null);
        setSelectedBooking(null);
        setResetNames(true);
        setResetPrices(true);
        setResetManualPrices(true);
    };

    // Helper functions
    //
    const getEquipmentListEntryPrices = (equipmentPrice: EquipmentPrice) => {
        return {
            pricePerHour:
                (pricePlan === PricePlan.EXTERNAL ? equipmentPrice?.pricePerHour : equipmentPrice?.pricePerHourTHS) ??
                0,
            pricePerUnit:
                (pricePlan === PricePlan.EXTERNAL ? equipmentPrice?.pricePerUnit : equipmentPrice?.pricePerUnitTHS) ??
                0,
        };
    };

    const getEquipmentName = (equipment: Equipment | undefined) =>
        language === Language.SV ? equipment?.name : equipment?.nameEN;

    const getEquipmentDescription = (equipment: Equipment | undefined) =>
        language === Language.SV ? equipment?.description : equipment?.descriptionEN;

    const isDisabled = (entry: EquipmentListEntry) => entry.equipment?.isArchived;

    // Table display functions
    //
    const EquipmentListEntrySelectionDisplayFn = (entry: EquipmentListEntry) => (
        <div className="text-center">
            <input
                type="checkbox"
                checked={selectedEquipmentListEntryIds.some((x) => x === entry.id)}
                disabled={isDisabled(entry)}
                onChange={() => toggleEquipmentListEntrySelection(entry)}
            />
        </div>
    );

    const EquipmentListEntryNameDisplayFn = (entry: EquipmentListEntry) => (
        <div onClick={() => toggleEquipmentListEntrySelection(entry)}>
            <div className="mb-0">
                {entry.name}
                {resetNames && entry.name != getEquipmentName(entry.equipment) && !isDisabled(entry) ? (
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip id="1">
                                Namnet kommer att återställas till <em>{getEquipmentName(entry.equipment)}</em>
                            </Tooltip>
                        }
                    >
                        <FontAwesomeIcon icon={faSync} className="ml-1" />
                    </OverlayTrigger>
                ) : null}
                {entry.equipment?.isArchived ? (
                    <Badge variant="warning" className="ml-2">
                        Arkiverad
                    </Badge>
                ) : null}
            </div>
            <div className="mb-0">
                <span className="text-muted">
                    {entry.description}
                    {resetNames &&
                    entry.description != getEquipmentDescription(entry.equipment) &&
                    !isDisabled(entry) ? (
                        <OverlayTrigger
                            placement="right"
                            overlay={
                                <Tooltip id="1">
                                    Beskrivningen kommer återställas till{' '}
                                    <em>{getEquipmentDescription(entry.equipment)}</em>
                                </Tooltip>
                            }
                        >
                            <FontAwesomeIcon icon={faSync} className="ml-1" />
                        </OverlayTrigger>
                    ) : null}
                </span>
            </div>
        </div>
    );

    const EquipmentListEntryNumberOfUnitsDisplayFn = (entry: EquipmentListEntry) => (
        <span>{entry.numberOfUnits} st</span>
    );

    const EquipmentListEntryNumberOfHoursDisplayFn = (entry: EquipmentListEntry) =>
        entry.numberOfHours ? <span>{entry.numberOfHours} h</span> : '-';

    const EquipmentListEntryDiscountDisplayFn = (entry: EquipmentListEntry) =>
        entry.discount ? <span className="text-danger">{formatNumberAsCurrency(entry.discount)}</span> : '-';

    const EquipmentListEntryPriceDisplayFn = (entry: EquipmentListEntry) => (
        <>
            {formatPrice({ pricePerHour: entry.pricePerHour, pricePerUnit: entry.pricePerUnit })}
            {resetPrices &&
            entry.equipment &&
            entry.equipmentPrice &&
            (entry.pricePerHour != getEquipmentListEntryPrices(entry.equipmentPrice).pricePerHour ||
                entry.pricePerUnit != getEquipmentListEntryPrices(entry.equipmentPrice).pricePerUnit) &&
            !isDisabled(entry) ? (
                <OverlayTrigger
                    placement="right"
                    overlay={
                        <Tooltip id="1">
                            Priset kommer återställas till:
                            <br />
                            <em>{formatPrice(getEquipmentListEntryPrices(entry.equipmentPrice))}</em>
                        </Tooltip>
                    }
                >
                    <FontAwesomeIcon icon={faSync} className="ml-1" />
                </OverlayTrigger>
            ) : null}
            {resetPrices &&
            resetManualPrices &&
            entry.equipment &&
            !entry.equipmentPrice &&
            entry.equipment.prices.length > 0 ? (
                <OverlayTrigger
                    placement="right"
                    overlay={
                        <Tooltip id="1">
                            Det manuella priset kommer återställas till
                            <br />
                            <em>
                                {entry.equipment.prices[0].name}:{' '}
                                {formatPrice(getEquipmentListEntryPrices(entry.equipment.prices[0]))}
                            </em>
                        </Tooltip>
                    }
                >
                    <FontAwesomeIcon icon={faSync} className="ml-1" />
                </OverlayTrigger>
            ) : null}
            {entry.equipment && entry.equipmentPrice && entry.equipment.prices.length > 1 ? (
                <p className="text-muted mb-0">{entry.equipmentPrice.name}</p>
            ) : null}
            {!entry.equipmentPrice ? <p className="text-muted mb-0 font-italic">Manuellt pris</p> : null}
        </>
    );

    // Table settings
    //
    const tableSettings: TableConfiguration<EquipmentListEntry> = {
        entityTypeDisplayName: '',
        customSortFn: sortIndexSortFn,
        hideTableFilter: true,
        hideTableCountControls: true,
        noResultsLabel: 'Listan är tom',
        columns: [
            {
                key: 'selection',
                displayName: '',
                getValue: () => '',
                getContentOverride: EquipmentListEntrySelectionDisplayFn,
            },
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (entry: EquipmentListEntry) => entry.name + ' ' + entry.description,
                getContentOverride: EquipmentListEntryNameDisplayFn,
            },
            {
                key: 'count',
                displayName: 'Antal',
                getValue: (entry: EquipmentListEntry) => entry.numberOfUnits,
                getContentOverride: EquipmentListEntryNumberOfUnitsDisplayFn,
                textAlignment: 'right',
                columnWidth: 80,
            },
            {
                key: 'hours',
                displayName: 'Timmar',
                getValue: (entry: EquipmentListEntry) => entry.numberOfHours,
                getContentOverride: EquipmentListEntryNumberOfHoursDisplayFn,
                textAlignment: 'right',
                columnWidth: 100,
            },
            {
                key: 'discount',
                displayName: 'Rabatt',
                getValue: (entry: EquipmentListEntry) => entry.discount,
                getContentOverride: EquipmentListEntryDiscountDisplayFn,
                textAlignment: 'right',
                columnWidth: 100,
            },
            {
                key: 'price',
                displayName: 'Pris',
                getValue: () => '',
                disableSort: true,
                getContentOverride: EquipmentListEntryPriceDisplayFn,
                columnWidth: 140,
                textAlignment: 'right',
            },
        ],
    };

    return (
        <Modal show={show} onHide={() => resetAndHide()} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Hämta utrustning från bokning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tab.Container id="import-equipment-tabs" activeKey={selectedBooking ? 'step-two' : 'step-one'}>
                    <Tab.Content>
                        <Tab.Pane eventKey="step-one">
                            <Card className="mb-3">
                                <Card.Header className="p-1"></Card.Header>
                                <Card.Body>
                                    <div className="d-flex">
                                        <p className="text-muted flex-grow-1 mb-0">
                                            <strong>Steg 1 av 2</strong> Sök efter en bokning att hämta utrustning från.
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>

                            <BookingSearch
                                id="import-equipment-booking-search"
                                placeholder="Sök bokning"
                                autoFocus={true}
                                onSelect={(selected) => selectBooking(selected.id)}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="step-two">
                            <Card className="mb-3">
                                <Card.Header className="p-1"></Card.Header>
                                <Card.Body>
                                    <div className="d-flex">
                                        <p className="text-muted flex-grow-1 mb-0">
                                            <strong>Steg 2 av 2</strong> Välj utrustningslista och utrustning.
                                        </p>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setSelectedBooking(null)}
                                            className="mr-2"
                                        >
                                            Gå tillbaka
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                            {selectedBooking?.equipmentLists ? (
                                <Form.Group controlId="equipmentList">
                                    <Form.Label>Välj utrustningslista</Form.Label>
                                    <Form.Control
                                        as="select"
                                        className="mb-3"
                                        autoFocus
                                        defaultValue={
                                            selectedBooking.equipmentLists.length === 1
                                                ? selectedBooking.equipmentLists[0].id
                                                : undefined
                                        }
                                        onChange={(e) => {
                                            const selectedListId = toIntOrUndefined(e.target.value);
                                            const equipmentList =
                                                selectedBooking?.equipmentLists?.find((x) => x.id === selectedListId) ??
                                                null;

                                            setSelectedEquipmentList(equipmentList);
                                            setSelectedEquipmentListEntryIds([]);
                                        }}
                                    >
                                        <option>Välj en utrustningslista</option>
                                        {selectedBooking.equipmentLists.map((x) => (
                                            <option key={x.id.toString()} value={x.id.toString()}>
                                                {x.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            ) : (
                                <span className="text-danger">Någonting gick fel, försök igen.</span>
                            )}

                            {selectedEquipmentList ? (
                                <>
                                    <div className="table-responsive">
                                        <TableDisplay
                                            configuration={tableSettings}
                                            entities={selectedEquipmentList.listEntries}
                                        />
                                    </div>

                                    <Form.Group controlId="resetNames">
                                        <Form.Check
                                            type="checkbox"
                                            label="Uppdatera namn och beskrivning till de senaste från utrustningsdatabasen"
                                            checked={resetNames}
                                            onChange={() => setResetNames(!resetNames)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="resetPrices">
                                        <Form.Check
                                            type="checkbox"
                                            label="Uppdatera priser till de senaste från utrustningsdatabasen"
                                            checked={resetPrices}
                                            onChange={() => setResetPrices(!resetPrices)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="resetManualPrices">
                                        <Form.Check
                                            type="checkbox"
                                            label="Ersätt även anpassade priser med de senaste från utrustningsdatabasen"
                                            checked={resetManualPrices && resetPrices}
                                            onChange={() => setResetManualPrices(!resetManualPrices)}
                                            disabled={!resetPrices}
                                        />
                                    </Form.Group>
                                </>
                            ) : null}

                            <Button
                                variant="primary"
                                disabled={!selectedEquipmentList || selectedEquipmentListEntryIds.length === 0}
                                className="mb-3"
                                onClick={() => importEquipment()}
                            >
                                <FontAwesomeIcon icon={faClone} className="mr-1" /> Lägg till utrustning (
                                {selectedEquipmentListEntryIds.length} st)
                            </Button>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    );
};

export default CopyEquipmentListEntriesModal;
