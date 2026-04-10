import React, { useEffect, useRef, useState } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import styles from './CustomerSearch.module.scss';
import { CustomersSearchResult } from '../models/misc/SearchResult';
import { getAccountKindName, getLanguageName, getPricePlanName, getResponseContentOrError } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { SplitHighlighter } from './utils/Highlight';
import { toCustomer } from '../lib/mappers/customer';
import { Customer } from '../models/interfaces/Customer';
import { Badge } from './ui/Badge';
import { Language } from '../models/enums/Language';

const inputBase =
    'bg-bs-4 border border-bs-4 text-body placeholder-muted px-3 py-1.5 text-sm focus:outline-none focus:border-bs-7 disabled:opacity-60 w-full';

type Props = {
    id: string;
    placeholder?: string;
    onSelect?: (selected: Customer) => unknown;
    onFocus?: () => unknown;
    onBlur?: () => unknown;
    autoFocus?: boolean;
};

const CustomerSearch: React.FC<Props> = ({ id, placeholder = '', onSelect, onFocus, onBlur, autoFocus }: Props) => {
    const { showErrorMessage } = useNotifications();

    const [searchResult, setSearchResult] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState('');

    const inputRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (inputRef.current && autoFocus) {
            inputRef.current.focus();
        }
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length === 0) {
            setSearchResult([]);
            setIsLoading(false);
            return;
        }
        debounceRef.current = setTimeout(() => fetchSearchResults(value), 300);
    };

    const fetchSearchResults = async (searchString: string) => {
        setIsLoading(true);
        const request = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch('/api/search/customers?s=' + searchString, request)
            .then(getResponseContentOrError)
            .then((data) => data as CustomersSearchResult)
            .then(convertSearchResultsForDisplay)
            .then(setSearchResult)
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Sökningen misslyckades');
            })
            .finally(() => setIsLoading(false));
    };

    const convertSearchResultsForDisplay = (results: CustomersSearchResult): Customer[] => {
        return results.customers.map((customer) => toCustomer(customer));
    };

    const handleSelect = (entity: Customer | null) => {
        if (entity && onSelect) {
            onSelect(entity);
        }
        setQuery('');
        setSearchResult([]);
    };

    type SearchListItemProps = {
        entity: Customer;
        searchText: string;
    };

    const SearchListItem = ({ entity, searchText }: SearchListItemProps): React.ReactElement => {
        return (
            <>
                <div>
                    <SplitHighlighter search={searchText} textToHighlight={entity.name} />
                </div>
                <div>
                    <small>
                        {entity.pricePlan !== undefined && entity.pricePlan !== null ? (
                            <Badge variant="dark" className="ml-1">
                                {getPricePlanName(entity.pricePlan)}
                            </Badge>
                        ) : null}
                        {entity.accountKind !== undefined && entity.accountKind !== null ? (
                            <Badge variant="dark" className="ml-1">
                                {getAccountKindName(entity.accountKind)}
                            </Badge>
                        ) : null}
                        {entity.invoiceHogiaId != null ? (
                            <Badge variant="dark" className="ml-1">
                                Hogia-id
                            </Badge>
                        ) : null}
                        {entity.invoiceAddress != null ? (
                            <Badge variant="dark" className="ml-1">
                                Fakturaadress
                            </Badge>
                        ) : null}
                        {entity.language === Language.EN ? (
                            <Badge variant="dark" className="ml-1">
                                {getLanguageName(entity.language)}
                            </Badge>
                        ) : null}
                    </small>
                </div>
            </>
        );
    };

    return (
        <Combobox as="div" className="relative" value={null} onChange={handleSelect} immediate>
            <ComboboxInput
                id={id}
                ref={inputRef}
                displayValue={() => ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                onFocus={onFocus}
                onBlur={onBlur}
                className={inputBase}
            />
            {query.length > 0 && (
                <ComboboxOptions className={styles.menu}>
                    {searchResult.length === 0 ? (
                        <div className={styles.menuHeader}>
                            <small>{isLoading ? 'Laddar...' : 'Inga matchingar'}</small>
                        </div>
                    ) : (
                        searchResult.map((entity) => (
                            <ComboboxOption key={entity.id} value={entity} className={styles.dropdownItem}>
                                <SearchListItem entity={entity} searchText={query} />
                            </ComboboxOption>
                        ))
                    )}
                </ComboboxOptions>
            )}
        </Combobox>
    );
};

export default CustomerSearch;
