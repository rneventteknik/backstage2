import React, { ChangeEvent } from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { HasId, HasStringId } from '../models/interfaces/BaseEntity';
import TableFooterWithViewCount from './utils/TableFooter';
import styles from './TableDisplay.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { notEmpty, onlyUnique } from '../lib/utils';

enum SortDirection {
    Ascending,
    Descending,
    Custom,
}

export type TableConfiguration<T extends HasId | HasStringId> = {
    entityTypeDisplayName: string;
    defaultSortPropertyName?: string;
    customSortFn?: (a: T, b: T) => number;
    moveFn?: (a: T, b: T, position?: 'before' | 'after') => void;
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
};

export const TableDisplay = <T extends HasId | HasStringId>({
    entities,
    subEntities = [],
    configuration,
    filterString: filterStringFromParent,
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

    // Handle drag end event for sorting
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || !configuration.moveFn) {
            return;
        }

        if (active.id !== over.id) {
            const entities = rowsToShow.filter(hasEntity).map((x) => x.entity);
            const activeIndex = entities.findIndex((x) => x.id === active.id);
            const overIndex = entities.findIndex((x) => x.id === over.id);
            const activeEntity = entities[activeIndex];
            const overEntity = entities[overIndex];

            if (activeEntity && overEntity) {
                // Determine position based on drag direction
                // When dragging down, we want to place AFTER the drop target
                // When dragging up, we want to place BEFORE the drop target
                const position = activeIndex < overIndex ? 'after' : 'before';
                configuration.moveFn(activeEntity, overEntity, position);
            }
        }
    };

    // Create the table
    //
    const sortableItems = rowsToShow.filter(hasEntity).map((x) => x.entity.id);

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
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                            {rowsToShow.map((x) =>
                        hasEntity(x) ? (
                            <TableRow
                                key={x.entity.id}
                                entity={x.entity}
                                configuration={configuration}
                                isSubItem={isSubItem}
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
                        </SortableContext>
                    </DndContext>
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
    configuration: TableConfiguration<T>;
    isSubItem: (entry: T) => boolean;
    showMoveControl: boolean;
};

const TableRow = <T extends HasId | HasStringId>({
    configuration,
    entity,
    isSubItem,
    showMoveControl,
}: TableRowProps<T>) => {
    // Set up drag-to-reorder (moveFn)
    //
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
        id: entity.id,
        disabled: !configuration.moveFn,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <>
            <tr
                ref={setNodeRef}
                style={style}
                className={(isDragging ? 'text-muted ' : '') + (isOver ? styles.hoveredRow : '')}
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
                    <td className="pr-0 align-middle d-none d-md-table-cell" {...attributes} {...listeners}>
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
