import React, { useState } from 'react';
import * as Typeahead from 'react-bootstrap-typeahead';
import styles from './EquipmentSearch.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { Badge } from 'react-bootstrap';
import { toEquipmentPackage } from '../lib/mappers/equipmentPackage';
import { EquipmentSearchResult } from '../models/misc/SearchResult';
import { getResponseContentOrError } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { toEquipment } from '../lib/mappers/equipment';
import { BaseEntityWithName } from '../models/interfaces/BaseEntity';
import { IEquipmentObjectionModel, IEquipmentPackageObjectionModel } from '../models/objection-models';

export enum ResultType {
    EQUIPMENT,
    EQUIPMENTPACKAGE,
}
export interface SearchResultViewModel extends BaseEntityWithName {
    type: ResultType;
    url: string;
}
interface HasIndex {
    index: number;
}

type Props = {
    id: string;
    placeholder?: string;
    includePackages?: boolean;
    onSelect?: (selected: SearchResultViewModel) => unknown;
    onFocus?: () => unknown;
    onBlur?: () => unknown;
};

const EquipmentSearch: React.FC<Props> = ({
    id,
    placeholder = '',
    includePackages = true,
    onSelect,
    onFocus,
    onBlur,
}: Props) => {
    const { showErrorMessage } = useNotifications();

    const [searchResult, setSearchResult] = useState<SearchResultViewModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSearchResults = async (searchString: string) => {
        setIsLoading(true);
        const request = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch('/api/search/equipment?s=' + searchString + '&includePackages=' + includePackages, request)
            .then(getResponseContentOrError)
            .then((data) => data as EquipmentSearchResult)
            .then(convertSearchResultsForDisplay)
            .then(setSearchResult)
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Sökningen misslyckades');
            })
            .finally(() => setIsLoading(false));
    };

    // The search API returns the search result as an object with seperate lists for bookings, equipment and
    // users, but the dropdown component requires all values in a single list and the type as a parameter.
    const convertSearchResultsForDisplay = (results: EquipmentSearchResult): SearchResultViewModel[] => {
        return ([] as SearchResultViewModel[])
            .concat(
                results.equipmentPackages.map((equipmentPackage) => ({
                    type: ResultType.EQUIPMENTPACKAGE,
                    url: '/equipmentPackage/' + equipmentPackage.id,
                    ...toEquipmentPackage(equipmentPackage),
                })),
            )
            .concat(
                results.equipment.map((equipment) => ({
                    type: ResultType.EQUIPMENT,
                    url: '/equipment/' + equipment.id,
                    ...toEquipment(equipment),
                })),
            );
    };

    const handleSelect = (selected: SearchResultViewModel[]) => {
        const selectedEntity = selected[0];
        if (selectedEntity && onSelect) {
            onSelect(selectedEntity);
        }
    };

    type SearchListItemProps<T extends SearchResultViewModel & HasIndex> = {
        entity: T;
        state: Typeahead.TypeaheadState<SearchResultViewModel>;
    };

    const SearchListItem = <T extends SearchResultViewModel & HasIndex>({
        entity,
        state,
    }: SearchListItemProps<T>): React.ReactElement => {
        const equipmentPackage = entity as unknown as IEquipmentObjectionModel | IEquipmentPackageObjectionModel;
        return (
            <>
                <div>
                    <Typeahead.Highlighter search={state.text}>{entity.name}</Typeahead.Highlighter>{' '}
                    {entity.type === ResultType.EQUIPMENTPACKAGE ? <FontAwesomeIcon icon={faCubes} /> : null}
                </div>
                <div>
                    <small>
                        {equipmentPackage.tags?.map((x) => (
                            <Badge variant="dark" key={x.id} className="mr-2">
                                {x.name}
                            </Badge>
                        ))}
                    </small>
                </div>
            </>
        );
    };

    const renderMenu = (
        results: Typeahead.TypeaheadResult<SearchResultViewModel>[],
        menuProps: Typeahead.TypeaheadMenuProps<SearchResultViewModel>,
        state: Typeahead.TypeaheadState<SearchResultViewModel>,
    ) => <Menu results={results} menuProps={menuProps} state={state}></Menu>;

    type MenuProps = {
        results: Typeahead.TypeaheadResult<SearchResultViewModel>[];
        menuProps: Typeahead.TypeaheadMenuProps<SearchResultViewModel>;
        state: Typeahead.TypeaheadState<SearchResultViewModel>;
    };

    const Menu = ({ results, menuProps, state }: MenuProps): React.ReactElement => {
        const resultWithIndex = results.map((res, index) => ({ index: index, ...res }));
        return (
            <Typeahead.Menu {...menuProps} className={styles.menu}>
                {resultWithIndex && resultWithIndex.length > 0 ? (
                    resultWithIndex.map((entity) => (
                        <Typeahead.MenuItem
                            key={entity.type + '-' + entity.id}
                            option={entity}
                            position={entity.index}
                            className={styles.dropdownItem}
                        >
                            <SearchListItem entity={entity} state={state}></SearchListItem>
                        </Typeahead.MenuItem>
                    ))
                ) : (
                    <Typeahead.Menu.Header>
                        <small>{isLoading ? 'Laddar...' : 'Inga matchingar'}</small>
                    </Typeahead.Menu.Header>
                )}
            </Typeahead.Menu>
        );
    };

    return (
        <Typeahead.AsyncTypeahead
            id={id}
            filterBy={() => true}
            labelKey={(x) => x.name}
            isLoading={isLoading}
            options={searchResult}
            selected={[]}
            onSearch={fetchSearchResults}
            onChange={handleSelect}
            renderMenu={renderMenu}
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};

export default EquipmentSearch;
