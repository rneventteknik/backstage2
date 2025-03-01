import React, { useEffect, useRef, useState } from 'react';
import * as Typeahead from 'react-bootstrap-typeahead';
import styles from './EquipmentSearch.module.scss';
import { Badge } from '../ui/Badge';
import { BookingsSearchResult } from '../models/misc/SearchResult';
import { getResponseContentOrError, getStatusName } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { BaseEntityWithName } from '../models/interfaces/BaseEntity';
import { IBookingObjectionModel } from '../models/objection-models';
import { toBooking } from '../lib/mappers/booking';
import BookingTypeTag from './utils/BookingTypeTag';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { SplitHighlighter } from './utils/Highlight';

export interface SearchResultViewModel extends BaseEntityWithName {
    url: string;
}
interface HasIndex {
    index: number;
}

type Props = {
    id: string;
    placeholder?: string;
    onSelect?: (selected: SearchResultViewModel) => unknown;
    onFocus?: () => unknown;
    onBlur?: () => unknown;
    autoFocus?: boolean;
};

const EquipmentSearch: React.FC<Props> = ({ id, placeholder = '', onSelect, onFocus, onBlur, autoFocus }: Props) => {
    const { showErrorMessage } = useNotifications();

    const [searchResult, setSearchResult] = useState<SearchResultViewModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const inputField = useRef<AsyncTypeahead<SearchResultViewModel>>(null);
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
        fetch('/api/search/bookings?s=' + searchString, request)
            .then(getResponseContentOrError)
            .then((data) => data as BookingsSearchResult)
            .then(convertSearchResultsForDisplay)
            .then(setSearchResult)
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Sökningen misslyckades');
            })
            .finally(() => setIsLoading(false));
    };

    const convertSearchResultsForDisplay = (results: BookingsSearchResult): SearchResultViewModel[] => {
        return results.bookings.map((booking) => ({
            url: '/booking/' + booking.id,
            ...toBooking(booking),
        }));
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
        const booking = entity as unknown as IBookingObjectionModel;
        return (
            <>
                <div>
                    <SplitHighlighter search={state.text} textToHighlight={entity.name} />
                </div>
                <div>
                    <small>
                        {booking.contactPersonName} <BookingTypeTag booking={booking} />{' '}
                        <Badge variant="dark" className="ml-1">
                            {getStatusName(booking.status)}
                        </Badge>
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

export default EquipmentSearch;
