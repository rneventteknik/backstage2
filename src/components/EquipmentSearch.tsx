import React, { useEffect, useState } from 'react';
import * as Typeahead from 'react-bootstrap-typeahead';
import styles from './EquipmentSearch.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCubes, faTag } from '@fortawesome/free-solid-svg-icons';
import { toEquipmentPackage } from '../lib/mappers/equipmentPackage';
import { EquipmentSearchResult } from '../models/misc/SearchResult';
import { getResponseContentOrError } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { toEquipment, toEquipmentTag } from '../lib/mappers/equipment';
import { BaseEntityWithName } from '../models/interfaces/BaseEntity';
import { IEquipmentObjectionModel, IEquipmentPackageObjectionModel } from '../models/objection-models';
import { Language } from '../models/enums/Language';
import { SplitHighlighter } from './utils/Highlight';
import EquipmentTagDisplay from './utils/EquipmentTagDisplay';
import { Badge } from 'react-bootstrap';

export enum ResultType {
    EQUIPMENT,
    EQUIPMENTPACKAGE,
    EQUIPMENTTAG,
}
export interface SearchResultViewModel extends BaseEntityWithName {
    type: ResultType;
    url: string;
    aiSuggestion: boolean;
}
interface HasIndex {
    index: number;
}

type Props = {
    id: string;
    placeholder?: string;
    includePackages?: boolean;
    includeTags?: boolean;
    language?: Language;
    onSelect?: (selected: SearchResultViewModel) => unknown;
    onFocus?: () => unknown;
    onBlur?: () => unknown;
    defaultResults?: SearchResultViewModel[];
};

const EquipmentSearch: React.FC<Props> = ({
    id,
    placeholder = '',
    includePackages = true,
    includeTags = false,
    language = Language.SV,
    defaultResults = [],
    onSelect,
    onFocus,
    onBlur,
}: Props) => {
    const { showErrorMessage } = useNotifications();

    const [searchResult, setSearchResult] = useState<SearchResultViewModel[]>(defaultResults);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setSearchResult(defaultResults);
    }, [defaultResults]);

    const fetchSearchResults = async (searchString: string) => {
        if (searchString === '') {
            setSearchResult(defaultResults);
            return;
        }

        setIsLoading(true);
        const request = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch(
            `/api/search/equipment?s=${searchString}&includePackages=${includePackages}&includeTags=${includeTags}`,
            request,
        )
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
                    aiSuggestion: false,
                    ...toEquipmentPackage(equipmentPackage),
                })),
            )
            .concat(
                results.equipment.map((equipment) => ({
                    type: ResultType.EQUIPMENT,
                    url: '/equipment/' + equipment.id,
                    aiSuggestion: false,
                    ...toEquipment(equipment),
                })),
            )
            .concat(
                results.equipmentTags.map((tag) => ({
                    type: ResultType.EQUIPMENTTAG,
                    url: '/equipment/' + tag.id,
                    aiSuggestion: false,
                    ...toEquipmentTag(tag),
                })),
            );
    };

    const handleSelect = (selected: SearchResultViewModel[]) => {
        const selectedEntity = selected[0];
        if (selectedEntity && onSelect) {
            onSelect(selectedEntity);
        }
        setSearchResult(defaultResults);
    };

    const onInputChange = (input: string) => {
        if (input.length === 0) {
            fetchSearchResults('');
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
        const typedEntity = entity as unknown as IEquipmentObjectionModel | IEquipmentPackageObjectionModel;
        const englishName: string | undefined = (entity as unknown as IEquipmentObjectionModel).nameEN;
        const displayName = language === Language.EN && englishName ? `${englishName} (${entity.name})` : entity.name;
        const score = (entity as unknown as { score: number }).score?.toFixed(2);
        return (
            <>
                <div>
                    <div className="d-flex">
                        <span className="flex-grow-1">
                            <SplitHighlighter search={state.text} textToHighlight={displayName} />{' '}
                            {entity.type === ResultType.EQUIPMENTPACKAGE ? <FontAwesomeIcon icon={faCubes} /> : null}
                            {entity.type === ResultType.EQUIPMENTTAG ? <FontAwesomeIcon icon={faTag} /> : null}
                            {(typedEntity as IEquipmentPackageObjectionModel).estimatedHours > 0 ? (
                                <FontAwesomeIcon icon={faClock} className="ml-2" />
                            ) : null}
                        </span>
                        {entity.aiSuggestion ? (
                            <span className="ml-auto text-muted text-small font-italic">
                                Förslag från AI {score ? <span className="d-none d-md-inline">({score})</span> : null}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div>
                    <small>
                        {typedEntity.tags?.map((x) => <EquipmentTagDisplay tag={x} key={x.id} className="mr-1" />)}
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
            onInputChange={onInputChange}
            minLength={0}
            useCache={false}
        />
    );
};

export default EquipmentSearch;
