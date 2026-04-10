import React, { useEffect, useRef, useState } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
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
import Image from 'next/image';
import { SplitHighlighter } from './utils/Highlight';
import EquipmentTagDisplay from './utils/EquipmentTagDisplay';

const inputBase =
    'bg-bs-4 border border-bs-4 text-body placeholder-muted px-3 py-1.5 text-sm focus:outline-none focus:border-bs-7 disabled:opacity-60 w-full';

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

type Props = {
    id: string;
    placeholder?: string;
    includePackages?: boolean;
    includeTags?: boolean;
    language?: Language;
    onSelect?: (selected: SearchResultViewModel) => unknown;
    onFocus?: () => unknown;
    onBlur?: () => unknown;
    defaultResults: SearchResultViewModel[];
};

const EquipmentSearch: React.FC<Props> = ({
    id,
    placeholder = '',
    includePackages = true,
    includeTags = false,
    language = Language.SV,
    defaultResults,
    onSelect,
    onFocus,
    onBlur,
}: Props) => {
    const { showErrorMessage } = useNotifications();

    const [searchResult, setSearchResult] = useState<SearchResultViewModel[]>(defaultResults);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        setSearchResult(defaultResults);
    }, [defaultResults]);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSearchResults(value), 300);
    };

    const fetchSearchResults = async (searchString: string) => {
        if (searchString === '') {
            // Sleeps to make sure all search result fetches are complete before setting default search results
            await new Promise((resolve) => setTimeout(resolve, 700));
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

    const handleSelect = (entity: SearchResultViewModel | null) => {
        if (entity && onSelect) {
            onSelect(entity);
        }
        setQuery('');
        setSearchResult(defaultResults);
    };

    type SearchListItemProps = {
        entity: SearchResultViewModel;
        searchText: string;
    };

    const SearchListItem = ({ entity, searchText }: SearchListItemProps): React.ReactElement => {
        const typedEntity = entity as unknown as IEquipmentObjectionModel | IEquipmentPackageObjectionModel;
        const englishName: string | undefined = (entity as unknown as IEquipmentObjectionModel).nameEN;
        const displayName = language === Language.EN && englishName ? `${englishName} (${entity.name})` : entity.name;
        return (
            <>
                <div>
                    <div className="d-flex">
                        <span className="flex-grow-1">
                            <SplitHighlighter search={searchText} textToHighlight={displayName} />{' '}
                            {entity.type === ResultType.EQUIPMENTPACKAGE ? <FontAwesomeIcon icon={faCubes} /> : null}
                            {entity.type === ResultType.EQUIPMENTTAG ? <FontAwesomeIcon icon={faTag} /> : null}
                            {(typedEntity as IEquipmentPackageObjectionModel).estimatedHours > 0 ? (
                                <FontAwesomeIcon icon={faClock} className="ms-2" />
                            ) : null}
                        </span>
                        {entity.aiSuggestion ? (
                            <div className="d-md-flex d-none ml-auto text-muted text-small font-italic align-items-center">
                                <div className="position-relative me-2" style={{ height: '0.75rem', width: '0.75rem' }}>
                                    <Image src="/ai-duck.svg" alt="Quack!" title="Quack!" fill={true} />
                                </div>
                                Rekommendation
                            </div>
                        ) : null}
                    </div>
                </div>
                <div>
                    <small>
                        {typedEntity.tags?.map((x) => <EquipmentTagDisplay tag={x} key={x.id} className="me-1" />)}
                    </small>
                </div>
                {entity.aiSuggestion ? (
                    <div className="d-md-none d-flex small ml-auto text-muted text-small font-italic align-items-center">
                        <div className="position-relative me-2" style={{ height: '0.75rem', width: '0.75rem' }}>
                            <Image src="/ai-duck.svg" alt="Quack!" title="Quack!" fill={true} />
                        </div>
                        Rekommendation
                    </div>
                ) : null}
            </>
        );
    };

    return (
        <Combobox as="div" className="relative" value={null} onChange={handleSelect} immediate>
            <ComboboxInput
                id={id}
                displayValue={() => ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                onFocus={onFocus}
                onBlur={onBlur}
                className={inputBase}
            />
            <ComboboxOptions className={styles.menu}>
                {searchResult.length === 0 ? (
                    <div className={styles.menuHeader}>
                        <small>{isLoading ? 'Laddar...' : 'Inga matchingar'}</small>
                    </div>
                ) : (
                    searchResult.map((entity) => (
                        <ComboboxOption
                            key={entity.type + '-' + entity.id}
                            value={entity}
                            className={styles.dropdownItem}
                        >
                            <SearchListItem entity={entity} searchText={query} />
                        </ComboboxOption>
                    ))
                )}
            </ComboboxOptions>
        </Combobox>
    );
};

export default EquipmentSearch;
