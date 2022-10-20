import React, { useEffect, useRef, useState } from 'react';
import * as Typeahead from 'react-bootstrap-typeahead';
import styles from './EquipmentSearch.module.scss';
import { CustomersSearchResult } from '../models/misc/SearchResult';
import { getAccountKindName, getLanguageName, getPricePlanName, getResponseContentOrError } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { SplitHighlighter } from './utils/Highlight';
import { toCustomer } from '../lib/mappers/customer';
import { Customer } from '../models/interfaces/Customer';
import { Badge } from 'react-bootstrap';
import { Language } from '../models/enums/Language';

interface HasIndex {
    index: number;
}

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

    const inputField = useRef<AsyncTypeahead<Customer>>(null);
    useEffect(() => {
        if (inputField.current && autoFocus) {
            inputField.current.focus();
        }
    });

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

    const handleSelect = (selected: Customer[]) => {
        const selectedEntity = selected[0];
        if (selectedEntity && onSelect) {
            onSelect(selectedEntity);
        }
    };

    type SearchListItemProps<T extends Customer & HasIndex> = {
        entity: T;
        state: Typeahead.TypeaheadState<Customer>;
    };

    const SearchListItem = <T extends Customer & HasIndex>({
        entity,
        state,
    }: SearchListItemProps<T>): React.ReactElement => {
        return (
            <>
                <div>
                    <SplitHighlighter search={state.text} textToHighlight={entity.name} />
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

    const renderMenu = (
        results: Typeahead.TypeaheadResult<Customer>[],
        menuProps: Typeahead.TypeaheadMenuProps<Customer>,
        state: Typeahead.TypeaheadState<Customer>,
    ) => <Menu results={results} menuProps={menuProps} state={state}></Menu>;

    type MenuProps = {
        results: Typeahead.TypeaheadResult<Customer>[];
        menuProps: Typeahead.TypeaheadMenuProps<Customer>;
        state: Typeahead.TypeaheadState<Customer>;
    };

    const Menu = ({ results, menuProps, state }: MenuProps): React.ReactElement => {
        const resultWithIndex = results.map((res, index) => ({ index: index, ...res }));
        return (
            <Typeahead.Menu {...menuProps} className={styles.menu}>
                {resultWithIndex && resultWithIndex.length > 0 ? (
                    resultWithIndex.map((entity) => (
                        <Typeahead.MenuItem
                            key={entity.id}
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
            ref={inputField}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};

export default CustomerSearch;
