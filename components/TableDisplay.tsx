import React, { ChangeEvent } from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { BaseEntity } from '../interfaces/BaseEntity';

export type TableConfiguration<T extends BaseEntity> = {
    defaultSortPropertyName: string;
    defaultSortAscending: boolean;
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
};

export function TableDisplay<T extends BaseEntity>({ entities, configuration }: ListProps<T>): React.ReactElement {
    // Store sort column and direction, and filter search text using state
    //
    const [sortKey, setSortKey] = React.useState<string>(configuration.defaultSortPropertyName);
    const [sortReverse, setSortReverse] = React.useState<boolean>(configuration.defaultSortAscending);
    const [filterString, setFilterString] = React.useState<string>('');

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
        const value: string = filterString.target.value;
        setFilterString(value);
    };

    // Sort and filter the entities before we generate the table
    //
    const sortedEntities = entities.sort(sortFn).filter(filterFn);

    // Create the table
    //
    return (
        <div>
            <FormGroup>
                <FormControl placeholder="Filter" onChange={setFilterConfiguration}></FormControl>
            </FormGroup>
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
                    {sortedEntities.map((entity) => (
                        <tr key={entity.id}>
                            {configuration.columns.map((p) => (
                                <td key={p.key} className={getTextAlignmentClassName(p.textAlignment)}>
                                    {p.getContentOverride ? p.getContentOverride(entity) : p.getValue(entity)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {sortedEntities.length === 0 ? (
                        <tr>
                            <td colSpan={configuration.columns.length} className="text-center font-italic text-muted">
                                Inga matchingar
                            </td>
                        </tr>
                    ) : null}
                </tbody>
            </Table>
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
