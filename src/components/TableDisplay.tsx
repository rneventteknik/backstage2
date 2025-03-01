import React, { ChangeEvent } from 'react';
import { HasId, HasStringId } from '../models/interfaces/BaseEntity';
import TableFooterWithViewCount from './utils/TableFooter';
import styles from './TableDisplay.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { useDrag, useDrop } from 'react-dnd';
import { notEmpty, onlyUnique } from '../lib/utils';
import { Table } from './ui/Table';
import { FormControl, FormGroup } from './ui/Form';

enum SortDirection {
    Ascending,
    Descending,
    Custom,
}

export type TableConfiguration<T extends HasId | HasStringId> = {
    entityTypeDisplayName: string;
    defaultSortPropertyName?: string;
    customSortFn?: (a: T, b: T) => number;
    moveFn?: (a: T, b: T) => void;
    noResultsLabel?: string;
    defaultSortAscending?: boolean;
    hideTableFilter?: boolean;
    hideTableCountControls?: boolean;
    columns: {
        key: string;
        displayName: string;
        getValue: (entity: T) => string | number;
        getHeadingValue?: (entity: T) => string | null;
        getContentOverride?: null | ((entity: T) => React.ReactElement | string);
        getHeadingContentOverride?: null | ((value: string | null) => React.ReactElement | string);
        getHeaderOverride?: null | ((entityList: T[]) => React.ReactElement | string);
        disableSort?: boolean;
        columnWidth?: number;
        textAlignment?: 'left' | 'center' | 'right';
        cellHideSize?: 'sm' | 'md' | 'lg' | 'xl';
        indentSubItems?: boolean;
        textTruncation?: boolean;
    }[];
    statusColumns?: {
        key: string;
        getValue: (entity: T) => string;
        getColor: (entity: T) => string;
    }[];
};

type ListProps<T extends HasId | HasStringId> = {
    entities: T[];
    subEntities?: { parentId: number | string; entities: T[] }[];
    configuration: TableConfiguration<T>;
    filterString?: string;
    tableId?: string;
};

export const TableDisplay = <T extends HasId | HasStringId>({
    entities,
    subEntities = [],
    configuration,
    filterString: filterStringFromParent,
    tableId,
}: ListProps<T>): React.ReactElement => {
    // Store sort column and direction, and filter search text using state
    //
    const [sortKey, setSortKey] = React.useState<string | null>(
        configuration.defaultSortPropertyName ?? (configuration.customSortFn ? null : configuration.columns[0].key),
    );
    const [sortDirection, setSortDirection] = React.useState<SortDirection>(
        configuration.customSortFn
            ? SortDirection.Custom
            : configuration.defaultSortAscending
              ? SortDirection.Ascending
              : SortDirection.Descending,
    );
    const [storedFilterString, setFilterString] = React.useState<string>('');
    const [viewCount, setViewCount] = React.useState(200);

    // Check if we should use the tables filter field or the filter string from the parent
    //
    const filterString = configuration.hideTableFilter ? filterStringFromParent ?? '' : storedFilterString;

    const getHeadingValue = configuration.columns.find((c) => c.key === sortKey)?.getHeadingValue ?? (() => null);
    const getHeadingContentOverride =
        configuration.columns.find((c) => c.key === sortKey)?.getHeadingContentOverride ?? (() => null);

    // Set up wrapping. We do this inside the function so we can access T and simplify the typing.
    //
    type WrappedEntity = { entity: T };
    type WrappedHeading = {
        heading: string | number | boolean | Date | null;
        contentOverride: React.ReactChild | null;
    };
    const hasEntity = (wrapperObject: WrappedEntity | WrappedHeading): wrapperObject is WrappedEntity =>
        !!wrapperObject && !!(wrapperObject as WrappedEntity).entity;

    // Set up sorting
    //
    const sortFn = (a: WrappedEntity, b: WrappedEntity) => {
        if (sortDirection === SortDirection.Custom && configuration.customSortFn) {
            return configuration.customSortFn(a.entity, b.entity);
        }

        const sortDirectionMultiplier = sortDirection == SortDirection.Ascending ? 1 : -1;
        const getValueFn = configuration.columns.find((c) => c.key === sortKey)?.getValue;

        if (!getValueFn) {
            throw 'Invalid column';
        }

        if (getValueFn(a.entity) < getValueFn(b.entity)) {
            return -1 * sortDirectionMultiplier;
        }
        if (getValueFn(a.entity) > getValueFn(b.entity)) {
            return 1 * sortDirectionMultiplier;
        }
        return 0;
    };

    const toggleNextSortDirection = () => {
        switch (sortDirection) {
            case SortDirection.Ascending:
                setSortDirection(SortDirection.Descending);
                return;

            case SortDirection.Descending:
                setSortDirection(configuration.customSortFn ? SortDirection.Custom : SortDirection.Ascending);
                return;

            default:
                setSortDirection(SortDirection.Ascending);
                return;
        }
    };

    const setSortConfiguration = (propertyName: string) => {
        setSortKey(propertyName);

        if (propertyName === sortKey) {
            toggleNextSortDirection();
        } else {
            setSortDirection(SortDirection.Ascending);
        }
    };

    // Set up filters
    //
    const filterFn = (entity: WrappedEntity) => {
        return configuration.columns.some(
            (c) =>
                c.getValue(entity.entity) &&
                c.getValue(entity.entity).toString().toLowerCase().indexOf(filterString.toLowerCase().trim()) > -1,
        );
    };

    const setFilterConfiguration = (filterString: ChangeEvent<HTMLInputElement>) => {
        setFilterString(filterString.target.value);
    };

    // Wrap entities in a wrapper object
    //
    const wrappedEntities: WrappedEntity[] = [...entities].map((x) => ({ entity: x }));

    // Sort and filter the entities before we generate the table
    //
    const sortedEntities: WrappedEntity[] = wrappedEntities.sort(sortFn).filter(filterFn);
    const sortedSubEntities = subEntities.map((list) => ({
        parentId: list.parentId,
        entities: list.entities
            .map((x) => ({ entity: x }))
            .sort(sortFn)
            .filter(filterFn),
    }));

    // Insert sub entities into table
    //
    sortedSubEntities.forEach((subList) => {
        const index = sortedEntities.findIndex((x) => x.entity && x.entity.id === subList.parentId);
        sortedEntities.splice(index + 1, 0, ...subList.entities);
    });

    const isSubItem = (item: T) => subEntities.some((list) => list.entities.some((x) => x.id === item.id));
    const getParentIdOfSubItem = (item: T) =>
        subEntities.find((list) => list.entities.some((x) => x.id === item.id))?.parentId;

    const rowsToShow: (WrappedEntity | WrappedHeading)[] = configuration.hideTableCountControls
        ? sortedEntities
        : sortedEntities.slice(0, viewCount);

    // Insert headings into table
    //
    const differentValues = rowsToShow
        .filter(hasEntity)
        .map((x) => getHeadingValue(x.entity))
        .filter(onlyUnique)
        .filter((x) => notEmpty(x) && x !== '');
    differentValues.forEach((value) => {
        const index = rowsToShow.findIndex((x) => hasEntity(x) && getHeadingValue(x.entity) === value);
        rowsToShow.splice(index, 0, { heading: value, contentOverride: getHeadingContentOverride(value) });
    });

    // Create the table
    //
    return (
        <div>
            {configuration.hideTableFilter ? null : (
                <FormGroup>
                    <FormControl placeholder="Filter" onChange={setFilterConfiguration}></FormControl>
                </FormGroup>
            )}
            <Table>
                <thead>
                    <tr>
                        {configuration.statusColumns?.map((p) => (
                            <th key={p.key} className="p-0" style={{ width: 3 }}></th>
                        ))}
                        {configuration.moveFn && sortDirection === SortDirection.Custom ? (
                            <th className="d-none d-md-table-cell" style={{ width: 10 }}></th>
                        ) : null}
                        {configuration.columns.map((p) => (
                            <th
                                key={p.key}
                                style={{ width: p.columnWidth }}
                                className={
                                    getTextAlignmentClassName(p.textAlignment) +
                                    ' ' +
                                    getCellDisplayClassName(p.cellHideSize)
                                }
                            >
                                {p.disableSort ? (
                                    <span>
                                        {p.getHeaderOverride
                                            ? p.getHeaderOverride(rowsToShow.filter(hasEntity).map((x) => x.entity))
                                            : p.displayName}
                                    </span>
                                ) : (
                                    <span style={{ cursor: 'pointer' }} onClick={() => setSortConfiguration(p.key)}>
                                        {p.getHeaderOverride
                                            ? p.getHeaderOverride(rowsToShow.filter(hasEntity).map((x) => x.entity))
                                            : p.displayName}{' '}
                                        {p.key === sortKey ? getSortingArrow(sortDirection) : null}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rowsToShow.map((x) =>
                        hasEntity(x) ? (
                            <TableRow
                                key={x.entity.id}
                                entity={x.entity}
                                entitiesToShow={rowsToShow.filter(hasEntity).map((x) => x.entity)}
                                tableId={tableId}
                                configuration={configuration}
                                isSubItem={isSubItem}
                                getParentIdOfSubItem={getParentIdOfSubItem}
                                showMoveControl={!!configuration.moveFn && sortDirection === SortDirection.Custom}
                            />
                        ) : (
                            <tr key={'heading-' + x.heading} className={styles.headingRow}>
                                {configuration.statusColumns?.map((p) => <td key={p.key} className={'p-0'}></td>)}
                                <td
                                    colSpan={configuration.columns.length + (configuration.statusColumns?.length ?? 0)}
                                    className="pt-4"
                                >
                                    {x.contentOverride === null ? (
                                        <strong>{x.heading?.toString()}</strong>
                                    ) : (
                                        x.contentOverride
                                    )}
                                </td>
                            </tr>
                        ),
                    )}
                    {rowsToShow.length === 0 ? (
                        <tr>
                            <td
                                colSpan={configuration.columns.length + (configuration.statusColumns?.length ?? 0)}
                                className="text-center font-italic text-muted"
                            >
                                {configuration.noResultsLabel ?? 'Inga matchingar'}
                            </td>
                        </tr>
                    ) : null}
                </tbody>
            </Table>

            {!configuration.hideTableCountControls ? (
                <TableFooterWithViewCount
                    viewCount={viewCount}
                    totalCount={sortedEntities.length}
                    setViewCount={setViewCount}
                    entityTypeDisplayName={configuration.entityTypeDisplayName}
                />
            ) : null}
        </div>
    );
};

const getTextAlignmentClassName = (textAlignment: string | undefined) => {
    switch (textAlignment) {
        case 'left':
            return 'text-left';
        case 'center':
            return 'text-center';
        case 'right':
            return 'text-right';
        default:
            return '';
    }
};

const getCellDisplayClassName = (screenSize: string | undefined) => {
    switch (screenSize) {
        case 'sm':
            return 'd-none d-sm-table-cell';
        case 'md':
            return 'd-none d-md-table-cell';
        case 'lg':
            return 'd-none d-lg-table-cell';
        case 'xl':
            return 'd-none d-xl-table-cell';
        default:
            return '';
    }
};

const getSortingArrow = (sortDirection: SortDirection) => {
    switch (sortDirection) {
        case SortDirection.Ascending:
            return <small>&#9660;</small>;
        case SortDirection.Descending:
            return <small>&#9650;</small>;
        default:
            return null;
    }
};

type TableRowProps<T extends HasId | HasStringId> = {
    entity: T;
    entitiesToShow: T[];
    configuration: TableConfiguration<T>;
    tableId?: string;
    isSubItem: (entry: T) => boolean;
    getParentIdOfSubItem: (entry: T) => number | string | undefined;
    showMoveControl: boolean;
};

const TableRow = <T extends HasId | HasStringId>({
    configuration,
    entity,
    entitiesToShow,
    tableId,
    isSubItem,
    getParentIdOfSubItem,
    showMoveControl,
}: TableRowProps<T>) => {
    // Set up drag-to-reorder (moveFn)
    //
    const [{ isDragging }, drag] = useDrag(() => ({
        type: isSubItem(entity)
            ? `table-${tableId}-subentity-${getParentIdOfSubItem(entity)}`
            : `table-${tableId}-entity`,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        item: { id: entity.id },
    }));

    const [collectedProps, drop] = useDrop(
        () => ({
            accept: isSubItem(entity)
                ? `table-${tableId}-subentity-${getParentIdOfSubItem(entity)}`
                : `table-${tableId}-entity`,
            drop: (data: HasId | HasStringId) => {
                const item = entitiesToShow.find((x) => x.id === data.id);

                if (!configuration.moveFn) {
                    throw new Error('Invalid state, moveFn is invalid');
                }
                if (!item) {
                    throw new Error('Invalid state, item is invalid');
                }

                configuration.moveFn(item, entity);
            },
            collect: (monitor) => ({
                hovered: monitor.isOver(),
            }),
        }),
        [entitiesToShow],
    );

    return (
        <>
            <tr
                ref={drop}
                className={(isDragging ? 'text-muted ' : '') + (collectedProps.hovered ? styles.hoveredRow : '')}
            >
                {configuration.statusColumns?.map((p) => (
                    <td
                        key={p.key}
                        className={'p-0 align-middle'}
                        style={{ backgroundColor: p.getColor(entity) }}
                        title={p.getValue(entity)}
                    ></td>
                ))}
                {showMoveControl ? (
                    <td className="pr-0 align-middle d-none d-md-table-cell" ref={drag}>
                        {isDragging ? null : <FontAwesomeIcon icon={faGripVertical} className="text-muted" />}
                    </td>
                ) : null}
                {configuration.columns.map((p) => (
                    <td
                        key={p.key}
                        className={
                            getTextAlignmentClassName(p.textAlignment) +
                            ' ' +
                            getCellDisplayClassName(p.cellHideSize) +
                            ' ' +
                            (p.indentSubItems && isSubItem(entity) ? 'pl-4' : '') +
                            (p.textTruncation ? styles.truncated : '') +
                            ' align-middle'
                        }
                    >
                        {p.getContentOverride ? p.getContentOverride(entity) : p.getValue(entity).toString()}
                    </td>
                ))}
            </tr>
        </>
    );
};
