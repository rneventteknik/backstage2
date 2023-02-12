import React from 'react';
import { Badge, Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { EquipmentPrice } from '../../../models/interfaces';
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
} from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { TableConfiguration, TableDisplay } from '../../TableDisplay';
import { toIntOrUndefined, reduceSumFn } from '../../../lib/utils';
import EquipmentSearch from '../../EquipmentSearch';
import { DoubleClickToEdit, DoubleClickToEditDropdown } from '../../utils/DoubleClickToEdit';
import {
    addVAT,
    addVATToPrice,
    addVATToPriceWithTHS,
    formatNumberAsCurrency,
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
    addFromSearch,
    deleteListEntry,
    deleteListHeadingEntry,
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
    saveViewModels,
    saveViewModelsOfHeading,
    toggleHideListEntry,
    updateListEntry,
    updateListHeadingEntry,
    viewModelIsHeading,
} from '../../../lib/equipmentListUtils';

type Props = {
    list: EquipmentList;
    pricePlan: PricePlan;
    language: Language;
    saveList: (updatedList: EquipmentList) => void;
    editEntry: (entry: EquipmentListEntry) => void;
    readonly: boolean;
};

const EquipmentListTable: React.FC<Props> = ({ list, pricePlan, language, saveList, editEntry, readonly }: Props) => {
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
                        <DoubleClickToEdit
                            value={heading.name}
                            onUpdate={(newValue) =>
                                updateListHeadingEntry(
                                    {
                                        ...heading,
                                        name: newValue && newValue.length > 0 ? newValue : heading.name,
                                    },
                                    list,
                                    saveList,
                                )
                            }
                            size="sm"
                            readonly={readonly}
                        >
                            {heading.name}
                            <span className="text-muted ml-2">
                                ({heading.listEntries.length} {heading.listEntries.length === 1 ? 'del' : 'delar'})
                            </span>
                        </DoubleClickToEdit>
                    </div>
                    <div className="mb-0 text-muted">
                        <DoubleClickToEdit
                            value={heading.description}
                            onUpdate={(newValue) =>
                                updateListHeadingEntry(
                                    {
                                        ...heading,
                                        description: newValue && newValue.length > 0 ? newValue : heading.description,
                                    },
                                    list,
                                    saveList,
                                )
                            }
                            size="sm"
                            readonly={readonly}
                        >
                            {heading.description && heading.description.length > 0 ? (
                                <span className="text-muted ">{heading.description}</span>
                            ) : (
                                <span className="text-muted font-italic">
                                    Dubbelklicka för att lägga till en beskrivning
                                </span>
                            )}{' '}
                        </DoubleClickToEdit>
                    </div>
                </>
            );
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);

        return (
            <>
                <div className={'mb-0' + (entry.isHidden ? ' text-muted' : '')}>
                    <DoubleClickToEdit
                        value={entry.name}
                        onUpdate={(newValue) =>
                            updateListEntry(
                                { ...entry, name: newValue && newValue.length > 0 ? newValue : entry.name },
                                list,
                                saveList,
                            )
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
                    </DoubleClickToEdit>
                </div>
                <div className="mb-0">
                    <DoubleClickToEdit
                        value={entry.description}
                        onUpdate={(newValue) => updateListEntry({ ...entry, description: newValue }, list, saveList)}
                        size="sm"
                        readonly={readonly}
                    >
                        {entry.description && entry.description.length > 0 ? (
                            <span className="text-muted ">{entry.description}</span>
                        ) : (
                            <span className="text-muted font-italic">
                                Dubbelklicka för att lägga till en beskrivning
                            </span>
                        )}
                    </DoubleClickToEdit>
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

        const valueIsRelevant = entry.pricePerUnit !== 0;

        if (!valueIsRelevant && entry.numberOfUnits === 1) {
            return <span className="text-muted">{entry.numberOfUnits} st</span>;
        }

        return (
            <DoubleClickToEdit
                value={entry.numberOfUnits?.toString()}
                onUpdate={(newValue) =>
                    updateListEntry({ ...entry, numberOfUnits: toIntOrUndefined(newValue, true) ?? 0 }, list, saveList)
                }
                size="sm"
                readonly={readonly}
            >
                <span className={valueIsRelevant ? '' : 'text-muted'}>{entry.numberOfUnits} st</span>
            </DoubleClickToEdit>
        );
    };

    const EquipmentListEntryNumberOfHoursDisplayFn = (viewModel: EquipmentListEntityViewModel) => {
        if (viewModelIsHeading(viewModel)) {
            return '';
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);
        const valueIsRelevant = entry.pricePerHour !== 0;

        if (!valueIsRelevant && entry.numberOfHours === 0) {
            return <></>;
        }

        return (
            <DoubleClickToEdit
                value={entry.numberOfHours.toString()}
                onUpdate={(newValue) =>
                    updateListEntry({ ...entry, numberOfHours: toIntOrUndefined(newValue, true) ?? 0 }, list, saveList)
                }
                size="sm"
                readonly={readonly}
            >
                <span className={valueIsRelevant ? '' : 'text-muted'}>{entry.numberOfHours} h</span>
            </DoubleClickToEdit>
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
            <>
                <DoubleClickToEditDropdown<EquipmentPrice>
                    options={
                        entry.equipmentPrice
                            ? entry.equipment.prices
                            : [customPriceDropdownValue, ...entry.equipment.prices]
                    }
                    value={entry.equipmentPrice ?? customPriceDropdownValue}
                    optionLabelFn={(x) => `${x.name} ${priceDisplayFn(addVATToPriceWithTHS(x))}`}
                    optionKeyFn={(x) => x.id.toString()}
                    onChange={(newPrice) =>
                        newPrice && newPrice.id != -1
                            ? updateListEntry(
                                  { ...entry, ...getEquipmentListEntryPrices(newPrice, pricePlan) },
                                  list,
                                  saveList,
                              )
                            : null
                    }
                    onClose={(newPrice) =>
                        newPrice && newPrice.id != -1
                            ? updateListEntry(
                                  { ...entry, ...getEquipmentListEntryPrices(newPrice, pricePlan) },
                                  list,
                                  saveList,
                              )
                            : null
                    }
                    readonly={readonly}
                >
                    {formatPrice(addVATToPrice({ pricePerHour: entry.pricePerHour, pricePerUnit: entry.pricePerUnit }))}
                    {entry.equipmentPrice && entry.equipment.prices.length > 1 ? (
                        <p className="text-muted mb-0">{entry.equipmentPrice.name}</p>
                    ) : null}
                </DoubleClickToEditDropdown>
            </>
        ) : (
            formatPrice(addVATToPrice({ pricePerHour: entry.pricePerHour, pricePerUnit: entry.pricePerUnit }))
        );
    };

    const EquipmentListEntryTotalPriceDisplayFn = (viewModel: EquipmentListEntityViewModel) => {
        if (viewModelIsHeading(viewModel)) {
            return '';
        }

        const entry = getEquipmentListEntryFromViewModel(viewModel);
        return (
            <em
                title={
                    entry.discount > 0
                        ? `${formatNumberAsCurrency(
                              addVAT(getPrice(entry, getNumberOfDays(list), false)),
                          )}\n-${formatNumberAsCurrency(
                              addVAT(getCalculatedDiscount(entry, getNumberOfDays(list))),
                          )} (rabatt)\n`
                        : ''
                }
                className={entry.discount > 0 ? 'text-danger' : ''}
            >
                {formatNumberAsCurrency(addVAT(getPrice(entry, getNumberOfDays(list))))}
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
                                onClick={() => moveListEntryUp(viewModel, list, saveList)}
                                disabled={isFirst(listEntries, viewModel)}
                            >
                                <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => moveListEntryDown(viewModel, list, saveList)}
                                disabled={isLast(listEntries, viewModel)}
                            >
                                <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                                onClick={() => deleteListHeadingEntry(heading, list, saveList)}
                                className="text-danger"
                            >
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
                            onClick={() => moveListEntryUp(viewModel, list, saveList)}
                            disabled={isFirst(peers, viewModel)}
                        >
                            <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => moveListEntryDown(viewModel, list, saveList)}
                            disabled={isLast(peers, viewModel)}
                        >
                            <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {getHeaderOfEntity(entry, list) ? (
                            <>
                                <Dropdown.Item onClick={() => moveListEntryIntoHeading(entry, null, list, saveList)}>
                                    <FontAwesomeIcon icon={faAngleLeft} className="mr-1 fa-fw" /> Flytta ut ur{' '}
                                    {getHeaderOfEntity(entry, list)?.name}
                                </Dropdown.Item>
                            </>
                        ) : (
                            getSortedList(list.listHeadings).map((heading) => (
                                <>
                                    <Dropdown.Item
                                        key={heading.id}
                                        onClick={() => moveListEntryIntoHeading(entry, heading.id, list, saveList)}
                                    >
                                        <FontAwesomeIcon icon={faAngleRight} className="mr-1 fa-fw" /> Flytta in i{' '}
                                        {heading.name}
                                    </Dropdown.Item>
                                </>
                            ))
                        )}
                        {list.listHeadings.length > 0 ? <Dropdown.Divider /> : null}
                    </>
                )}
                <Dropdown.Item href={'/equipment/' + entry.equipmentId} target="_blank" disabled={!entry.equipment}>
                    <FontAwesomeIcon icon={faExternalLink} className="mr-1 fa-fw" /> Öppna utrustning i ny flik
                </Dropdown.Item>
                {readonly ? null : (
                    <>
                        <Dropdown.Item onClick={() => toggleHideListEntry(entry, list, saveList)}>
                            <FontAwesomeIcon icon={entry.isHidden ? faEye : faEyeSlash} className="mr-1 fa-fw" />{' '}
                            {entry.isHidden ? 'Sluta dölja rad för kund' : 'Dölj rad för kund'}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editEntry(entry)}>
                            <FontAwesomeIcon icon={faGears} className="mr-1 fa-fw" /> Avancerad redigering
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            onClick={() =>
                                entry.equipment
                                    ? updateListEntry(
                                          getDefaultListEntryFromEquipment(
                                              entry.equipment,
                                              pricePlan,
                                              language,
                                              entry.id,
                                              entry.sortIndex,
                                          ),
                                          list,
                                          saveList,
                                      )
                                    : null
                            }
                        >
                            <FontAwesomeIcon icon={faEraser} className="mr-1 fa-fw" /> Återställ rad
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => deleteListEntry(entry, list, saveList)} className="text-danger">
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
            saveViewModels(movedItems, list, saveList);

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
            saveViewModelsOfHeading(movedItems, heading, list, saveList);

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
                                  .reduce(reduceSumFn, 0)
                            : getPrice(getEquipmentListEntryFromViewModel(viewModel), getNumberOfDays(list)),
                    ),
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
                        onSelect={(x) => addFromSearch(x, list, pricePlan, language, saveList)}
                    />
                </div>
            )}
        </>
    );
};

export default EquipmentListTable;
