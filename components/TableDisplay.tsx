import React, { ChangeEvent } from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { BaseEntity } from '../interfaces/BaseEntity';
import TableFooterWithViewCount from './utils/TableFooter';

export type TableConfiguration<T extends BaseEntity> = {
    entityTypeDisplayName: string;
    defaultSortPropertyName: string;
    defaultSortAscending: boolean;
    hideTableFilter?: boolean;
    hideTableCountControls?: boolean;
    columns: {
        key: string;
        displayName: string;
        getValue: (entity: T) => string | number | Date;
        getContentOverride?: null | ((entity: T) => React.ReactElement);
        disableSort?: boolean;
        columnWidth?: number;
        textAlignment?: 'left' | 'center' | 'right';
    }[];
};

type ListProps<T extends BaseEntity> = {
    entities: T[];
    configuration: TableConfiguration<T>;
    filterString?: string;
};

export function TableDisplay<T extends BaseEntity>({
    entities,
    configuration,
    filterString: filterStringFromParent,
}: ListProps<T>): React.ReactElement {
    // Store sort column and direction, and filter search text using state
    //
    const [sortKey, setSortKey] = React.useState<string>(configuration.defaultSortPropertyName);
    const [sortReverse, setSortReverse] = React.useState<boolean>(configuration.defaultSortAscending);
    const [storedFilterString, setFilterString] = React.useState<string>('');
    const [viewCount, setViewCount] = React.useState(25);

    // Check if we should use the tables filter field or the filter string from the parent
    //
    const filterString = configuration.hideTableFilter ? filterStringFromParent ?? '' : storedFilterString;

    // Set up sorting
    //
    const sortFn = (a: T, b: T) => {
        const sortDirectionMultiplier = sortReverse ? 1 : -1;
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

    const setSortConfiguration = (propertyName: string) => {
        setSortKey(propertyName);

        if (propertyName === sortKey) {
            setSortReverse(!sortReverse);
        } else {
            setSortReverse(true);
        }
    };

    // Set up filters
    //
    const filterFn = (entity: T) => {
        return configuration.columns.some(
            (c) => c.getValue(entity).toString().toLowerCase().indexOf(filterString.toLowerCase().trim()) > -1,
        );
    };

    const setFilterConfiguration = (filterString: ChangeEvent<HTMLInputElement>) => {
        setFilterString(filterString.target.value);
    };

    // Sort and filter the entities before we generate the table
    //
    const sortedEntities = entities.sort(sortFn).filter(filterFn);

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
            <Table hover>
                <colgroup>
                    {configuration.columns.map((p) => (
                        <col key={p.key} style={{ width: p.columnWidth }} />
                    ))}
                </colgroup>
                <thead>
                    <tr>
                        {configuration.columns.map((p) => (
                            <th key={p.key} className={getTextAlignmentClassName(p.textAlignment)}>
                                {p.disableSort ? (
                                    <span>{p.displayName}</span>
                                ) : (
                                    <span style={{ cursor: 'pointer' }} onClick={() => setSortConfiguration(p.key)}>
                                        {p.displayName} {p.key === sortKey ? getSortingArrow(sortReverse) : null}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {entitiesToShow.map((entity) => (
                        <tr key={entity.id}>
                            {configuration.columns.map((p) => (
                                <td key={p.key} className={getTextAlignmentClassName(p.textAlignment)}>
                                    {p.getContentOverride ? p.getContentOverride(entity) : p.getValue(entity)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {entitiesToShow.length === 0 ? (
                        <tr>
                            <td colSpan={configuration.columns.length} className="text-center font-italic text-muted">
                                Inga matchingar
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
}

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

const getSortingArrow = (sortReverse: boolean) => {
    return sortReverse ? <small>&#9660;</small> : <small>&#9650;</small>;
};
