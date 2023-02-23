import React, { ChangeEvent } from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { HasId, HasStringId } from '../models/interfaces/BaseEntity';
import TableFooterWithViewCount from './utils/TableFooter';
import styles from './TableDisplay.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { useDrag, useDrop } from 'react-dnd';

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
        getValue: (entity: T) => string | number | Date;
        getContentOverride?: null | ((entity: T) => React.ReactElement | string);
        getHeaderOverride?: null | ((entityList: T[]) => React.ReactElement | string);
        disableSort?: boolean;
        columnWidth?: number;
        textAlignment?: 'left' | 'center' | 'right';
        cellHideSize?: 'sm' | 'md' | 'lg' | 'xl';
        indentSubItems?: boolean;
        textTruncation?: boolean;
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

    // Set up sorting
    //
    const sortFn = (a: T, b: T) => {
        if (sortDirection === SortDirection.Custom && configuration.customSortFn) {
            return configuration.customSortFn(a, b);
        }

        const sortDirectionMultiplier = sortDirection == SortDirection.Ascending ? 1 : -1;
        const getValueFn = configuration.columns.find((c) => c.key === sortKey)?.getValue;

        if (!getValueFn) {
            throw 'Invalid column';
        }

        if (getValueFn(a) < getValueFn(b)) {
            return -1 * sortDirectionMultiplier;
        }
        if (getValueFn(a) > getValueFn(b)) {
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
    const filterFn = (entity: T) => {
        return configuration.columns.some(
            (c) =>
                c.getValue(entity) &&
                c.getValue(entity).toString().toLowerCase().indexOf(filterString.toLowerCase().trim()) > -1,
        );
    };

    const setFilterConfiguration = (filterString: ChangeEvent<HTMLInputElement>) => {
        setFilterString(filterString.target.value);
    };

    // Sort and filter the entities before we generate the table
    //
    const sortedEntities = [...entities].sort(sortFn).filter(filterFn);
    const sortedSubEntities = subEntities.map((list) => ({
        parentId: list.parentId,
        entities: list.entities.sort(sortFn).filter(filterFn),
    }));

    // Insert sub entities into table
    //
    sortedSubEntities.forEach((subList) => {
        const index = sortedEntities.findIndex((x) => x.id === subList.parentId);
        sortedEntities.splice(index + 1, 0, ...subList.entities);
    });

    const isSubItem = (item: T) => subEntities.some((list) => list.entities.some((x) => x.id === item.id));
    const getParentIdOfSubItem = (item: T) =>
        subEntities.find((list) => list.entities.some((x) => x.id === item.id))?.parentId;

    const entitiesToShow = configuration.hideTableCountControls ? sortedEntities : sortedEntities.slice(0, viewCount);

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
                                        {p.getHeaderOverride ? p.getHeaderOverride(entitiesToShow) : p.displayName}
                                    </span>
                                ) : (
                                    <span style={{ cursor: 'pointer' }} onClick={() => setSortConfiguration(p.key)}>
                                        {p.getHeaderOverride ? p.getHeaderOverride(entitiesToShow) : p.displayName}{' '}
                                        {p.key === sortKey ? getSortingArrow(sortDirection) : null}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {entitiesToShow.map((entity) => (
                        <TableRow
                            key={entity.id}
                            entity={entity}
                            entitiesToShow={entitiesToShow}
                            tableId={tableId}
                            configuration={configuration}
                            isSubItem={isSubItem}
                            getParentIdOfSubItem={getParentIdOfSubItem}
                            showMoveControl={!!configuration.moveFn && sortDirection === SortDirection.Custom}
                        />
                    ))}
                    {entitiesToShow.length === 0 ? (
                        <tr>
                            <td colSpan={configuration.columns.length} className="text-center font-italic text-muted">
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
            drop: (data) => {
                const item = entitiesToShow.find((x) => x.id === (data as HasId | HasStringId).id);

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
                        {p.getContentOverride ? p.getContentOverride(entity) : p.getValue(entity)}
                    </td>
                ))}
            </tr>
        </>
    );
};
