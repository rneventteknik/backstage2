import React, { useEffect, useRef, useState } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import styles from './BookingSearch.module.scss';
import { BookingsSearchResult } from '../models/misc/SearchResult';
import { getResponseContentOrError } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { BaseEntityWithName } from '../models/interfaces/BaseEntity';
import { IBookingObjectionModel } from '../models/objection-models';
import { toBooking } from '../lib/mappers/booking';
import { SplitHighlighter } from './utils/Highlight';
import { toBookingViewModel } from '../lib/datetimeUtils';

const inputBase =
    'bg-bs-4 border border-bs-4 text-body placeholder-muted px-3 py-1.5 text-sm focus:outline-none focus:border-bs-7 disabled:opacity-60 w-full';

export interface SearchResultViewModel extends BaseEntityWithName {
    url: string;
}

type Props = {
    id: string;
    placeholder?: string;
    onSelect?: (selected: SearchResultViewModel) => unknown;
    onFocus?: () => unknown;
    onBlur?: () => unknown;
    autoFocus?: boolean;
};

const BookingSearch: React.FC<Props> = ({ id, placeholder = '', onSelect, onFocus, onBlur, autoFocus }: Props) => {
    const { showErrorMessage } = useNotifications();

    const [searchResult, setSearchResult] = useState<SearchResultViewModel[]>([]);
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

    const handleSelect = (entity: SearchResultViewModel | null) => {
        if (entity && onSelect) {
            onSelect(entity);
        }
        setQuery('');
        setSearchResult([]);
    };

    type SearchListItemProps = {
        entity: SearchResultViewModel;
        searchText: string;
    };

    const SearchListItem = ({ entity, searchText }: SearchListItemProps): React.ReactElement => {
        const booking = entity as unknown as IBookingObjectionModel;
        const viewModel = toBookingViewModel(toBooking(booking));

        return (
            <>
                <div>
                    <SplitHighlighter search={searchText} textToHighlight={entity.name} />
                </div>
                <div>
                    <small>
                        {booking.customerName} / {booking.contactPersonName}
                        {booking.contactPersonName && viewModel.displayUsageInterval !== '-' ? ' / ' : ''}
                        {viewModel.displayUsageInterval === '-' ? null : viewModel.monthYearUsageStartString}
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

export default BookingSearch;
