import React, { useState } from 'react';
import { Badge, Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Equipment, EquipmentPackage, EquipmentPrice, TimeEstimate } from '../../../models/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faAngleUp,
    faEraser,
    faExternalLink,
    faGears,
    faTrashCan,
    faAngleRight,
    faAngleLeft,
    faEyeSlash,
    faEye,
    faDollarSign,
    fa0,
    faPercent,
} from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry, EquipmentListHeading } from '../../../models/interfaces/EquipmentList';
import { TableConfiguration, TableDisplay } from '../../TableDisplay';
import { toIntOrUndefined, reduceSumFn, getResponseContentOrError } from '../../../lib/utils';
import EquipmentSearch, { ResultType } from '../../EquipmentSearch';
import { ClickToEdit, ClickToEditDropdown } from '../../utils/DoubleClickToEdit';
import {
    addVAT,
    addVATToPrice,
    addVATToPriceWithTHS,
    formatCurrency,
    formatPrice,
    formatTHSPrice,
    getCalculatedDiscount,
    getPrice,
} from '../../../lib/pricingUtils';
import { PricePlan } from '../../../models/enums/PricePlan';
import { getSortedList, isFirst, isLast, moveItemToItem, sortIndexSortFn } from '../../../lib/sortIndexUtils';
import EquipmentListEntryConflictStatus from './EquipmentListEntryConflictStatus';
import { getEquipmentInDatetime, getEquipmentOutDatetime, getNumberOfDays } from '../../../lib/datetimeUtils';
import { Language } from '../../../models/enums/Language';
import {
    addEquipment,
    addEquipmentPackage,
    EquipmentListEntityViewModel,
    getDefaultListEntryFromEquipment,
    getEntitiesToDisplay,
    getEquipmentListEntryFromViewModel,
    getEquipmentListEntryPrices,
    getEquipmentListHeadingFromViewModel,
    getHeaderOfEntity,
    getPeersOfViewModel,
    getSubEntitiesToDisplay,
    moveListEntryDown,
    moveListEntryIntoHeading,
    moveListEntryUp,
    saveSortIndexOfViewModels,
    toggleHideListEntry,
    viewModelIsHeading,
} from '../../../lib/equipmentListUtils';
import SelectNumberOfUnitsAndHoursModal from './SelectNumberOfUnitsAndHoursModal';
import { IEquipmentObjectionModel, IEquipmentPackageObjectionModel } from '../../../models/objection-models';
import { toEquipment } from '../../../lib/mappers/equipment';
import { toEquipmentPackage } from '../../../lib/mappers/equipmentPackage';
import TimeEstimateModal from '../timeEstimate/TimeEstimateModal';
import PackageInfoModal from './PackageInfoModal';
import currency from 'currency.js';

type Props = {
    list: EquipmentList;
    otherLists: EquipmentList[];
    pricePlan: PricePlan;
    language: Language;
    defaultLaborHourlyRate: number;
    showPricesAsMuted: boolean;
    saveListEntry: (entry: EquipmentListEntry) => void;
    saveListHeading: (heading: EquipmentListHeading) => void;
    saveListEntriesAndHeadings: (
        entries: Partial<EquipmentListEntry>[],
        headings: Partial<EquipmentListHeading>[],
    ) => void;
    deleteListEntry: (entry: EquipmentListEntry) => void;
    deleteListHeading: (heading: EquipmentListHeading) => void;
    addListEntries: (entries: EquipmentListEntry[], listId: number | undefined, headerId?: number | undefined) => void;
    addListHeading: (heading: EquipmentListHeading, listId: number) => void;
    addTimeEstimate: (timeEstimate: Partial<TimeEstimate>) => void;
    editEntry: (entry: EquipmentListEntry) => void;
    readonly: boolean;
};

const EquipmentListTable: React.FC<Props> = ({
    list,
    otherLists,
    pricePlan,
    language,
    defaultLaborHourlyRate,
    showPricesAsMuted,
    saveListEntry,
    saveListHeading,
    saveListEntriesAndHeadings,
    deleteListEntry,
    deleteListHeading,
    addListEntries,
    addListHeading,
    addTimeEstimate,
    editEntry,
    readonly,
}: Props) => {
    const [equipmentToAdd, setEquipmentToAdd] = useState<Equipment | null>(null);
    const [equipmentPackageToAdd, setEquipmentPackageToAdd] = useState<EquipmentPackage | null>(null);
    const [equipmentPackageTimeEstimateToAdd, setEquipmentPackageTimeEstimateToAdd] =
        useState<Partial<TimeEstimate> | null>(null);

    // Helper functions
    //
    const priceDisplayFn = pricePlan === PricePlan.EXTERNAL ? formatPrice : formatTHSPrice;

    // Table display functions
    //

    const EquipmentListEntryNameDisplayFn = (viewModel: EquipmentListEntityViewModel) => {
        if (viewModelIsHeading(viewModel)) {
            const heading = getEquipmentListHeadingFromViewModel(viewModel);

            return (
                <>
                    <div className="mb-0">
                        <ClickToEdit
                            value={heading.name}
                            onUpdate={(newValue) =>
                                saveListHeading({
                                    ...heading,
                                    name: newValue && newValue.length > 0 ? newValue : heading.name,
                                })
                            }
                            size="sm"
                            readonly={readonly}
                        >
                            {heading.name}
                            <span className="text-muted ml-2">
                                ({heading.listEntries.length} {heading.listEntries.length === 1 ? 'del' : 'delar'})
                            </span>
                        </ClickToEdit>
                    </div>
                    <div className="mb-0 text-muted">
                        <ClickToEdit
                            value={heading.description}
                            onUpdate={(newValue) =>
                                saveListHeading({
                                    ...heading,
                                    description: newValue && newValue.length > 0 ? newValue : heading.description,
                                })
                            }
                            size="sm"
                            readonly={readonly}
                        >
                            {heading.description && heading.description.length > 0 ? (
                                <span className="text-muted ">{heading.description}</span>
                            ) : (
                                <span className="text-muted font-italic">
                                    {readonly ? null : 'Dubbelklicka för att lägga till en beskrivning'}
                                </span>
                            )}{' '}
                        </ClickToEdit>
                    </div>
                </>
            );
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);

        return (
            <>
                <div className={'mb-0' + (entry.isHidden ? ' text-muted' : '')}>
                    <ClickToEdit
                        value={entry.name}
                        onUpdate={(newValue) =>
                            saveListEntry({ ...entry, name: newValue && newValue.length > 0 ? newValue : entry.name })
                        }
                        size="sm"
                        readonly={readonly}
                    >
                        {entry.name}
                        {entry.equipment?.isArchived ? (
                            <Badge variant="warning" className="ml-1" title="">
                                Arkiverad
                            </Badge>
                        ) : null}
                        {entry.equipment && getEquipmentOutDatetime(list) && getEquipmentInDatetime(list) ? (
                            <span className="ml-1" title="">
                                <EquipmentListEntryConflictStatus
                                    equipment={entry.equipment}
                                    equipmentList={list}
                                    otherLists={otherLists}
                                    startDatetime={getEquipmentOutDatetime(list) ?? new Date()}
                                    endDatetime={getEquipmentInDatetime(list) ?? new Date()}
                                />
                            </span>
                        ) : null}
                        {entry.isHidden ? (
                            <OverlayTrigger
                                placement="right"
                                overlay={
                                    <Tooltip id="1">
                                        <strong>Denna utrustning är dold för kunden.</strong>
                                    </Tooltip>
                                }
                            >
                                <FontAwesomeIcon icon={faEyeSlash} className="ml-1" title="" />
                            </OverlayTrigger>
                        ) : null}
                        {entry.account ? (
                            <OverlayTrigger
                                placement="right"
                                overlay={
                                    <Tooltip id="1">
                                        <strong>Denna utrustning har ett anpassat konto ({entry.account}).</strong>
                                    </Tooltip>
                                }
                            >
                                <FontAwesomeIcon icon={faDollarSign} className="ml-1" title="" />
                            </OverlayTrigger>
                        ) : null}
                    </ClickToEdit>
                </div>
                <div className="mb-0">
                    <ClickToEdit
                        value={entry.description}
                        onUpdate={(newValue) => saveListEntry({ ...entry, description: newValue })}
                        size="sm"
                        readonly={readonly}
                    >
                        {entry.description && entry.description.length > 0 ? (
                            <span className="text-muted ">{entry.description}</span>
                        ) : (
                            <span className="text-muted font-italic">
                                {readonly ? null : 'Dubbelklicka för att lägga till en beskrivning'}
                            </span>
                        )}
                    </ClickToEdit>
                </div>

                <div className="mb-0 text-muted d-md-none">{EquipmentListEntryNumberOfHoursDisplayFn(viewModel)}</div>
                <div className="mb-0 text-muted d-md-none">{EquipmentListEntryPriceDisplayFn(viewModel)}</div>
                <div className="mb-0 text-muted d-md-none">{EquipmentListEntryTotalPriceDisplayFn(viewModel)}</div>
            </>
        );
    };

    const EquipmentListEntryNumberOfUnitsDisplayFn = (viewModel: EquipmentListEntityViewModel) => {
        if (viewModelIsHeading(viewModel)) {
            return '';
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);

        const valueIsRelevant = entry.pricePerUnit.value !== 0 || entry.pricePerHour.value === 0;

        if (!valueIsRelevant && entry.numberOfUnits === 1) {
            return <span className="text-muted">{entry.numberOfUnits} st</span>;
        }

        return (
            <ClickToEdit
                value={entry.numberOfUnits?.toString()}
                onUpdate={(newValue) =>
                    saveListEntry({ ...entry, numberOfUnits: toIntOrUndefined(newValue, true) ?? 0 })
                }
                size="sm"
                readonly={readonly}
            >
                <span className={valueIsRelevant ? '' : 'text-muted'}>{entry.numberOfUnits} st</span>
            </ClickToEdit>
        );
    };

    const EquipmentListEntryNumberOfHoursDisplayFn = (viewModel: EquipmentListEntityViewModel) => {
        if (viewModelIsHeading(viewModel)) {
            return '';
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);
        const valueIsRelevant = entry.pricePerHour.value !== 0;

        if (!valueIsRelevant && entry.numberOfHours === 0) {
            return <></>;
        }

        return (
            <ClickToEdit
                value={entry.numberOfHours.toString()}
                onUpdate={(newValue) =>
                    saveListEntry({ ...entry, numberOfHours: toIntOrUndefined(newValue, true) ?? 0 })
                }
                size="sm"
                readonly={readonly}
            >
                <span className={valueIsRelevant ? '' : 'text-muted'}>{entry.numberOfHours} h</span>
            </ClickToEdit>
        );
    };

    const EquipmentListEntryPriceDisplayFn = (viewModel: EquipmentListEntityViewModel) => {
        if (viewModelIsHeading(viewModel)) {
            return '';
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);

        if (entry.isHidden) {
            return <span className="text-muted">-</span>;
        }

        const customPriceDropdownValue: EquipmentPrice = {
            id: -1,
            name: 'Anpassat pris',
            pricePerUnit: entry.pricePerUnit,
            pricePerHour: entry.pricePerHour,
            pricePerUnitTHS: entry.pricePerUnit,
            pricePerHourTHS: entry.pricePerHour,
        };
        return entry.equipment && entry.equipment.prices.length ? (
            <span className={showPricesAsMuted ? 'text-muted' : ''}>
                <ClickToEditDropdown<EquipmentPrice>
                    options={
                        entry.equipmentPrice
                            ? entry.equipment.prices
                            : [customPriceDropdownValue, ...entry.equipment.prices]
                    }
                    value={entry.equipmentPrice ?? customPriceDropdownValue}
                    optionLabelFn={(x) => `${x.name} ${priceDisplayFn(addVATToPriceWithTHS(x), false)}`}
                    optionKeyFn={(x) => x.id.toString()}
                    onChange={(newPrice) =>
                        newPrice && newPrice.id != -1
                            ? saveListEntry({ ...entry, ...getEquipmentListEntryPrices(newPrice, pricePlan) })
                            : null
                    }
                    onClose={(newPrice) =>
                        newPrice && newPrice.id != -1
                            ? saveListEntry({ ...entry, ...getEquipmentListEntryPrices(newPrice, pricePlan) })
                            : null
                    }
                    readonly={readonly}
                >
                    {formatPrice(addVATToPrice(entry))}
                    {entry.equipmentPrice && entry.equipment.prices.length > 1 ? (
                        <p className="text-muted mb-0">{entry.equipmentPrice.name}</p>
                    ) : null}
                </ClickToEditDropdown>
            </span>
        ) : (
            <span className={showPricesAsMuted ? 'text-muted' : ''}>{formatPrice(addVATToPrice(entry))}</span>
        );
    };

    const EquipmentListEntryTotalPriceDisplayFn = (viewModel: EquipmentListEntityViewModel) => {
        if (viewModelIsHeading(viewModel)) {
            return '';
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);
        const priceWithoutDiscount = formatCurrency(addVAT(getPrice(entry, getNumberOfDays(list), false)));
        const discount = formatCurrency(addVAT(getCalculatedDiscount(entry, getNumberOfDays(list))));
        const priceWithDiscount = formatCurrency(addVAT(getPrice(entry, getNumberOfDays(list))));

        return (
            <em className={showPricesAsMuted ? 'text-muted' : ''}>
                {entry.discount.value > 0 ? (
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip id="1">
                                <p className="mb-0">{priceWithoutDiscount}</p>
                                <p className="mb-0">-{discount} (rabatt)</p>
                            </Tooltip>
                        }
                    >
                        <span className="text-danger">{priceWithDiscount}</span>
                    </OverlayTrigger>
                ) : (
                    <span>{priceWithDiscount}</span>
                )}
            </em>
        );
    };

    const EquipmentListEntryActionsDisplayFn = (viewModel: EquipmentListEntityViewModel) => {
        if (viewModelIsHeading(viewModel)) {
            const heading = getEquipmentListHeadingFromViewModel(viewModel);

            return (
                <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                    {readonly ? null : (
                        <>
                            <Dropdown.Item
                                onClick={() => moveListEntryUp(viewModel, list, saveListEntriesAndHeadings)}
                                disabled={isFirst(listEntries, viewModel)}
                            >
                                <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => moveListEntryDown(viewModel, list, saveListEntriesAndHeadings)}
                                disabled={isLast(listEntries, viewModel)}
                            >
                                <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => deleteListHeading(heading)} className="text-danger">
                                <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort rad
                            </Dropdown.Item>
                        </>
                    )}
                </DropdownButton>
            );
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);
        const peers = getPeersOfViewModel(viewModel, list);
        return (
            <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                {readonly ? null : (
                    <>
                        <Dropdown.Item
                            onClick={() => moveListEntryUp(viewModel, list, saveListEntriesAndHeadings)}
                            disabled={isFirst(peers, viewModel)}
                        >
                            <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => moveListEntryDown(viewModel, list, saveListEntriesAndHeadings)}
                            disabled={isLast(peers, viewModel)}
                        >
                            <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {getHeaderOfEntity(entry, list) ? (
                            <>
                                <Dropdown.Item
                                    onClick={() => moveListEntryIntoHeading(entry, null, list, saveListEntry)}
                                >
                                    <FontAwesomeIcon icon={faAngleLeft} className="mr-1 fa-fw" /> Flytta ut ur{' '}
                                    {getHeaderOfEntity(entry, list)?.name}
                                </Dropdown.Item>
                            </>
                        ) : (
                            getSortedList(list.listHeadings).map((heading) => (
                                <Dropdown.Item
                                    key={heading.id}
                                    onClick={() => moveListEntryIntoHeading(entry, heading.id, list, saveListEntry)}
                                >
                                    <FontAwesomeIcon icon={faAngleRight} className="mr-1 fa-fw" /> Flytta in i{' '}
                                    {heading.name}
                                </Dropdown.Item>
                            ))
                        )}
                        {list.listHeadings.length > 0 ? <Dropdown.Divider /> : null}
                    </>
                )}
                <Dropdown.Item href={'/equipment/' + entry.equipmentId} target="_blank" disabled={!entry.equipment}>
                    <FontAwesomeIcon icon={faExternalLink} className="mr-1 fa-fw" /> Öppna utrustning i ny flik
                </Dropdown.Item>
                {readonly ? (
                    <Dropdown.Item onClick={() => editEntry(entry)}>
                        <FontAwesomeIcon icon={faGears} className="mr-1 fa-fw" /> Visa detaljer
                    </Dropdown.Item>
                ) : (
                    <>
                        <Dropdown.Item onClick={() => toggleHideListEntry(entry, saveListEntry)}>
                            <FontAwesomeIcon icon={entry.isHidden ? faEye : faEyeSlash} className="mr-1 fa-fw" />{' '}
                            {entry.isHidden ? 'Sluta dölja rad för kund' : 'Dölj rad för kund'}
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() =>
                                saveListEntry({
                                    ...entry,
                                    equipmentPrice: undefined,
                                    pricePerUnit: currency(0),
                                    pricePerHour: currency(0),
                                })
                            }
                        >
                            <FontAwesomeIcon icon={fa0} className="mr-1 fa-fw" /> Sätt anpassat pris till 0
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() =>
                                saveListEntry({
                                    ...entry,
                                    discount: getPrice(entry, getNumberOfDays(list), false),
                                })
                            }
                        >
                            <FontAwesomeIcon icon={faPercent} className="mr-1 fa-fw" /> Sätt rabatt till 100%
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editEntry(entry)}>
                            <FontAwesomeIcon icon={faGears} className="mr-1 fa-fw" /> Avancerad redigering
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            onClick={() =>
                                entry.equipment
                                    ? saveListEntry({
                                          ...getDefaultListEntryFromEquipment(
                                              entry.equipment,
                                              pricePlan,
                                              language,
                                              entry.id,
                                              entry.sortIndex,
                                          ),
                                          numberOfUnits: entry.numberOfUnits,
                                          numberOfHours: entry.numberOfHours,
                                      })
                                    : null
                            }
                        >
                            <FontAwesomeIcon icon={faEraser} className="mr-1 fa-fw" /> Återställ rad
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => deleteListEntry(entry)} className="text-danger">
                            <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort rad
                        </Dropdown.Item>
                    </>
                )}
            </DropdownButton>
        );
    };

    const sortFn = (a: EquipmentListEntityViewModel, b: EquipmentListEntityViewModel) => sortIndexSortFn(a, b);
    const moveFn = (a: EquipmentListEntityViewModel, b: EquipmentListEntityViewModel) => {
        if (a.id === b.id) {
            return;
        }

        const listEntries = getEntitiesToDisplay(list);
        const subListEntries = getSubEntitiesToDisplay(list).flatMap((x) => x.entities);

        if (listEntries.some((x) => x.id === a.id) && listEntries.some((x) => x.id === b.id)) {
            // Move items
            const movedItems = moveItemToItem(getEntitiesToDisplay(list), a, b);

            // Save inner entity as well
            movedItems.forEach((x) => (x.entity = { ...x.entity, sortIndex: x.sortIndex }));

            // Save list
            saveSortIndexOfViewModels(movedItems, saveListEntriesAndHeadings);

            return;
        }

        if (subListEntries.some((x) => x.id === a.id) && subListEntries.some((x) => x.id === b.id)) {
            const heading = getEntitiesToDisplay(list).find((x) => x.id === a.parentId);

            if (a.parentId != b.parentId || !heading) {
                throw new Error('Invalid target');
            }

            // Move items
            const movedItems = moveItemToItem(getPeersOfViewModel(a, list), a, b);

            // Save inner entity as well
            movedItems.forEach((x) => (x.entity = { ...x.entity, sortIndex: x.sortIndex }));

            // Save list
            saveSortIndexOfViewModels(movedItems, saveListEntriesAndHeadings);

            return;
        }

        throw new Error('Invalid target');
    };

    // Lists of entities for table
    //
    const listEntries = getEntitiesToDisplay(list);
    const subListEntries = getSubEntitiesToDisplay(list);

    // Table settings
    //
    const tableSettings: TableConfiguration<EquipmentListEntityViewModel> = {
        entityTypeDisplayName: '',
        customSortFn: sortFn,
        moveFn: readonly ? undefined : moveFn,
        hideTableFilter: true,
        hideTableCountControls: true,
        noResultsLabel: 'Listan är tom',
        columns: [
            {
                key: 'name',
                displayName: 'Utrustning',
                indentSubItems: true,
                getValue: (viewModel: EquipmentListEntityViewModel) =>
                    viewModel.entity.name + ' ' + viewModel.entity.description,
                getContentOverride: EquipmentListEntryNameDisplayFn,
            },
            {
                key: 'count',
                displayName: 'Antal',
                getValue: (viewModel: EquipmentListEntityViewModel) =>
                    viewModelIsHeading(viewModel)
                        ? getEquipmentListHeadingFromViewModel(viewModel)
                              .listEntries.map((x) => x.numberOfUnits)
                              .reduce(reduceSumFn, 0)
                        : getEquipmentListEntryFromViewModel(viewModel).numberOfUnits,
                getContentOverride: EquipmentListEntryNumberOfUnitsDisplayFn,
                textAlignment: 'right',
                columnWidth: 80,
            },
            {
                key: 'hours',
                displayName: 'Timmar',
                getValue: (viewModel: EquipmentListEntityViewModel) =>
                    viewModelIsHeading(viewModel)
                        ? getEquipmentListHeadingFromViewModel(viewModel)
                              .listEntries.map((x) => x.numberOfHours)
                              .reduce(reduceSumFn, 0)
                        : getEquipmentListEntryFromViewModel(viewModel).numberOfHours,
                getContentOverride: EquipmentListEntryNumberOfHoursDisplayFn,
                textAlignment: 'right',
                cellHideSize: 'md',
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
                cellHideSize: 'md',
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (viewModel: EquipmentListEntityViewModel) =>
                    addVAT(
                        viewModelIsHeading(viewModel)
                            ? getEquipmentListHeadingFromViewModel(viewModel)
                                  .listEntries.map((x) => getPrice(x, getNumberOfDays(list)))
                                  .reduce((a, b) => a.add(b), currency(0))
                            : getPrice(getEquipmentListEntryFromViewModel(viewModel), getNumberOfDays(list)),
                    ).value,
                getContentOverride: EquipmentListEntryTotalPriceDisplayFn,
                columnWidth: 90,
                textAlignment: 'right',
                cellHideSize: 'md',
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                disableSort: true,
                getContentOverride: EquipmentListEntryActionsDisplayFn,
                columnWidth: 75,
                textAlignment: 'center',
            },
        ],
    };

    // HTML template
    //
    return (
        <>
            <TableDisplay
                entities={listEntries}
                subEntities={subListEntries}
                configuration={tableSettings}
                tableId={'equipment-list-' + list.id}
            />

            {readonly ? null : (
                <div className="ml-2 mr-2 mb-2">
                    <EquipmentSearch
                        placeholder="Lägg till utrustning"
                        includePackages={true}
                        language={language}
                        id="equipment-search"
                        onSelect={(x) => {
                            switch (x.type) {
                                case ResultType.EQUIPMENT:
                                    return fetch('/api/equipment/' + x.id)
                                        .then((apiResponse) =>
                                            getResponseContentOrError<IEquipmentObjectionModel>(apiResponse),
                                        )
                                        .then(toEquipment)
                                        .then((equipment) => {
                                            setEquipmentToAdd(equipment);
                                        });

                                case ResultType.EQUIPMENTPACKAGE:
                                    return fetch('/api/equipmentPackage/' + x.id)
                                        .then((apiResponse) =>
                                            getResponseContentOrError<IEquipmentPackageObjectionModel>(apiResponse),
                                        )
                                        .then(toEquipmentPackage)
                                        .then((equipmentPackage) => {
                                            setEquipmentPackageToAdd(equipmentPackage);
                                        });
                            }
                        }}
                    />
                    {!!equipmentToAdd ? (
                        <SelectNumberOfUnitsAndHoursModal
                            show={!!equipmentToAdd}
                            onHide={() => setEquipmentToAdd(null)}
                            onSave={(numberOfUnits, numberOfHours, selectedPriceId) => {
                                if (!equipmentToAdd) {
                                    throw new Error('Invalid state: Missing searchResultModelToAdd.');
                                }

                                addEquipment(
                                    equipmentToAdd,
                                    list,
                                    pricePlan,
                                    language,
                                    addListEntries,
                                    numberOfUnits,
                                    numberOfHours,
                                    selectedPriceId,
                                );
                                setEquipmentToAdd(null);
                            }}
                            // Number of hours are shown if and only if there is a price per hour.
                            // Number of units are shown if there is no price per hour, or if there is both a price per hour and price per unit and the number of units in our inventory is larger than 1.
                            showNumberOfUnits={
                                (!!getEquipmentListEntryPrices(equipmentToAdd.prices[0], pricePlan).pricePerUnit
                                    .value &&
                                    equipmentToAdd.inventoryCount != 1) ||
                                !getEquipmentListEntryPrices(equipmentToAdd.prices[0], pricePlan).pricePerHour.value
                            }
                            showNumberOfHours={
                                !!getEquipmentListEntryPrices(equipmentToAdd.prices[0], pricePlan).pricePerHour.value
                            }
                            title={language === Language.SV ? equipmentToAdd.name : equipmentToAdd.nameEN}
                            equipment={equipmentToAdd}
                            priceplan={pricePlan}
                            startDatetime={getEquipmentOutDatetime(list) ?? null}
                            endDatetime={getEquipmentInDatetime(list) ?? null}
                        />
                    ) : null}
                    {equipmentPackageToAdd && !equipmentPackageTimeEstimateToAdd ? (
                        <PackageInfoModal
                            show={!!equipmentPackageToAdd}
                            onHide={() => setEquipmentPackageToAdd(null)}
                            onSave={() => {
                                if (equipmentPackageToAdd.estimatedHours > 0) {
                                    setEquipmentPackageTimeEstimateToAdd({
                                        name:
                                            language === Language.SV
                                                ? equipmentPackageToAdd.name
                                                : equipmentPackageToAdd.nameEN ?? '',
                                        numberOfHours: equipmentPackageToAdd.estimatedHours,
                                        pricePerHour: currency(defaultLaborHourlyRate),
                                    });
                                } else {
                                    addEquipmentPackage(
                                        equipmentPackageToAdd,
                                        list,
                                        pricePlan,
                                        language,
                                        addListHeading,
                                        addListEntries,
                                    );
                                    setEquipmentPackageToAdd(null);
                                }
                            }}
                            equipmentPackage={equipmentPackageToAdd}
                            language={language}
                        />
                    ) : null}
                    {equipmentPackageToAdd && equipmentPackageTimeEstimateToAdd ? (
                        <TimeEstimateModal
                            timeEstimate={equipmentPackageTimeEstimateToAdd}
                            setTimeEstimate={(x) =>
                                setEquipmentPackageTimeEstimateToAdd({ ...equipmentPackageTimeEstimateToAdd, ...x })
                            }
                            defaultLaborHourlyRate={defaultLaborHourlyRate}
                            formId={'time-estimate-form'}
                            onSubmit={() => {
                                addEquipmentPackage(
                                    equipmentPackageToAdd,
                                    list,
                                    pricePlan,
                                    language,
                                    addListHeading,
                                    addListEntries,
                                );
                                addTimeEstimate(equipmentPackageTimeEstimateToAdd);
                                setEquipmentPackageToAdd(null);
                                setEquipmentPackageTimeEstimateToAdd(null);
                            }}
                            onHide={() => {
                                setEquipmentPackageToAdd(null);
                                setEquipmentPackageTimeEstimateToAdd(null);
                            }}
                            showWizard={false}
                        />
                    ) : null}
                </div>
            )}
        </>
    );
};

export default EquipmentListTable;
