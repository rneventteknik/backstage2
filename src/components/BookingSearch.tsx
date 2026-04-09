import React, { useEffect, useRef, useState } from 'react';
import * as Typeahead from 'react-bootstrap-typeahead';
import type { RenderMenuProps, TypeaheadComponentProps } from 'react-bootstrap-typeahead';
import styles from './BookingSearch.module.scss';
import { BookingsSearchResult } from '../models/misc/SearchResult';
import { getResponseContentOrError } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { BaseEntityWithName } from '../models/interfaces/BaseEntity';
import { IBookingObjectionModel } from '../models/objection-models';
import { toBooking } from '../lib/mappers/booking';
import { SplitHighlighter } from './utils/Highlight';
import { toBookingViewModel } from '../lib/datetimeUtils';

type Option = TypeaheadComponentProps['options'][number];
type RenderMenuState = Parameters<NonNullable<TypeaheadComponentProps['renderMenu']>>[2];

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

    const inputField = useRef<Typeahead.TypeaheadRef | null>(null);
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
        state: RenderMenuState;
    };

    const SearchListItem = <T extends SearchResultViewModel & HasIndex>({
        entity,
        state,
    }: SearchListItemProps<T>): React.ReactElement => {
        const booking = entity as unknown as IBookingObjectionModel;
        const viewModel = toBookingViewModel(toBooking(booking));

        return (
            <>
                <div>
                    <SplitHighlighter search={state.text} textToHighlight={entity.name} />
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

    const renderMenu = (
        results: Option[],
        menuProps: RenderMenuProps,
        state: RenderMenuState,
    ) => <Menu results={results} menuProps={menuProps} state={state}></Menu>;

    type MenuProps = {
        results: Option[];
        menuProps: RenderMenuProps;
        state: RenderMenuState;
    };

    const Menu = ({ results, menuProps, state }: MenuProps): React.ReactElement => {
        const resultWithIndex = (results as SearchResultViewModel[]).map((res, index) => ({ index: index, ...res }));
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
            labelKey={(x: Option) => (x as SearchResultViewModel).name}
            isLoading={isLoading}
            options={searchResult}
            selected={[]}
            onSearch={fetchSearchResults}
            onChange={(selected) => handleSelect(selected as SearchResultViewModel[])}
            renderMenu={renderMenu}
            placeholder={placeholder}
            ref={inputField}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};

export default EquipmentSearch;
