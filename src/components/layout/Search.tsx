import React, { useState } from 'react';
import * as Typeahead from 'react-bootstrap-typeahead';
import { useRouter } from 'next/router';
import { SearchResult } from '../../models/misc/SearchResult';
import { groupBy, getResponseContentOrError } from '../../lib/utils';
import styles from './Search.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCube, faCubes, faUser, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
    IEquipmentObjectionModel,
    IBookingObjectionModel,
    IUserObjectionModel,
    IEquipmentPackageObjectionModel,
} from '../../models/objection-models';
import { useNotifications } from '../../lib/useNotifications';
import { toUser } from '../../lib/mappers/user';
import { toBooking } from '../../lib/mappers/booking';
import { toEquipment } from '../../lib/mappers/equipment';
import { BaseEntityWithName } from '../../models/interfaces/BaseEntity';
import { SplitHighlighter } from '../utils/Highlight';
import EquipmentTagDisplay from '../utils/EquipmentTagDisplay';
import { toBookingViewModel } from '../../lib/datetimeUtils';
import { toEquipmentPackage } from '../../lib/mappers/equipmentPackage';

enum ResultType {
    BOOKING,
    EQUIPMENT,
    EQUIPMENT_PACKAGE,
    USER,
}
interface SearchResultViewModel extends BaseEntityWithName {
    type: ResultType;
    url: string;
}
interface HasIndex {
    index: number;
}

type Props = {
    onFocus?: () => unknown;
    onBlur?: () => unknown;
};

const Search: React.FC<Props> = ({ onFocus, onBlur }: Props) => {
    const router = useRouter();
    const { showErrorMessage } = useNotifications();

    const [searchResult, setSearchResult] = useState<SearchResultViewModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSearchResults = async (searchString: string) => {
        setIsLoading(true);
        const request = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch('/api/search?s=' + searchString, request)
            .then(getResponseContentOrError)
            .then((data) => data as SearchResult)
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
    const convertSearchResultsForDisplay = (results: SearchResult): SearchResultViewModel[] => {
        return ([] as SearchResultViewModel[])
            .concat(
                results.bookings.map((booking) => ({
                    type: ResultType.BOOKING,
                    url: '/bookings/' + booking.id,
                    ...toBooking(booking),
                })),
            )
            .concat(
                results.equipment.map((equipment) => ({
                    type: ResultType.EQUIPMENT,
                    url: '/equipment/' + equipment.id,
                    ...toEquipment(equipment),
                })),
            )
            .concat(
                results.equipmentPackage.map((equipmentPackage) => ({
                    type: ResultType.EQUIPMENT_PACKAGE,
                    url: '/equipmentPackage/' + equipmentPackage.id,
                    ...toEquipmentPackage(equipmentPackage),
                })),
            )
            .concat(
                results.users.map((user) => ({
                    type: ResultType.USER,
                    url: '/users/' + user.id,
                    ...toUser(user),
                })),
            );
    };

    const handleSelect = (selected: SearchResultViewModel[]) => {
        const selectedEntity = selected[0];
        if (selectedEntity) {
            router.push(selectedEntity.url);
        }
    };

    type ResultSectionProps<T extends SearchResultViewModel & HasIndex> = {
        results: T[];
        heading: string;
        icon: IconDefinition;
        state: Typeahead.TypeaheadState<SearchResultViewModel>;
    };

    const ResultSection = <T extends SearchResultViewModel & HasIndex>({
        results,
        heading,
        icon,
        state,
    }: ResultSectionProps<T>): React.ReactElement => {
        const getDescription = (entity: T, highlightText: string) => {
            switch (entity.type) {
                case ResultType.USER:
                    const user = entity as unknown as IUserObjectionModel;
                    return (
                        <small>
                            <SplitHighlighter search={highlightText} textToHighlight={user.nameTag} /> /{' '}
                            <SplitHighlighter search={highlightText} textToHighlight={user.emailAddress} />
                        </small>
                    );

                case ResultType.EQUIPMENT:
                    const equipment = entity as unknown as IEquipmentObjectionModel;
                    return (
                        <small>
                            <SplitHighlighter search={highlightText} textToHighlight={equipment.nameEN} />{' '}
                            {equipment.tags?.map((x) => <EquipmentTagDisplay tag={x} key={x.id} className="mr-1" />)}
                        </small>
                    );

                case ResultType.EQUIPMENT_PACKAGE:
                    const equipmentPackage = entity as unknown as IEquipmentPackageObjectionModel;
                    return (
                        <small>
                            <SplitHighlighter
                                search={highlightText}
                                textToHighlight={equipmentPackage.nameEN || equipmentPackage.name}
                            />{' '}
                            {equipmentPackage.tags?.map((x) => (
                                <EquipmentTagDisplay tag={x} key={x.id} className="mr-1" />
                            ))}
                        </small>
                    );

                case ResultType.BOOKING:
                    const booking = entity as unknown as IBookingObjectionModel;
                    const viewModel = toBookingViewModel(toBooking(booking));
                    return (
                        <small>
                            <SplitHighlighter search={highlightText} textToHighlight={booking.customerName} /> /{' '}
                            <SplitHighlighter search={highlightText} textToHighlight={booking.contactPersonName} />
                            {booking.contactPersonName && viewModel.displayUsageInterval !== '-' ? ' / ' : ''}
                            {viewModel.displayUsageInterval === '-' ? null : viewModel.monthYearUsageStartString}
                        </small>
                    );
                default:
            }
        };

        return (
            <>
                <Typeahead.Menu.Header>
                    <FontAwesomeIcon icon={icon} /> {heading}
                </Typeahead.Menu.Header>
                {results && results.length > 0 ? (
                    results.map((entity) => (
                        <Typeahead.MenuItem
                            key={entity.id}
                            option={entity}
                            position={entity.index}
                            className={styles.dropdownItem}
							href={entity.url}
                        >
                            <SplitHighlighter search={state.text} textToHighlight={entity.name} />
                            <div>{getDescription(entity, state.text)}</div>
                        </Typeahead.MenuItem>
                    ))
                ) : (
                    <Typeahead.Menu.Header>
                        <small>{isLoading ? 'Laddar...' : 'Inga matchingar'}</small>
                    </Typeahead.Menu.Header>
                )}
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
        const res = groupBy(resultWithIndex, (x) => x.type);

        return (
            <Typeahead.Menu {...menuProps} className={styles.menu}>
                <ResultSection
                    heading="Bokningar"
                    icon={faCalendarDay}
                    results={res[ResultType.BOOKING]}
                    state={state}
                />

                <Typeahead.Menu.Divider />
                <ResultSection heading="Utrustning" icon={faCube} results={res[ResultType.EQUIPMENT]} state={state} />

                <Typeahead.Menu.Divider />
                <ResultSection
                    heading="Utrustningspaket"
                    icon={faCubes}
                    results={res[ResultType.EQUIPMENT_PACKAGE]}
                    state={state}
                ></ResultSection>

                <Typeahead.Menu.Divider />
                <ResultSection heading="Användare" icon={faUser} results={res[ResultType.USER]} state={state} />
            </Typeahead.Menu>
        );
    };

    return (
        <Typeahead.AsyncTypeahead
            id="search"
            filterBy={() => true}
            labelKey={(x) => x.name}
            isLoading={isLoading}
            options={searchResult}
            onSearch={fetchSearchResults}
            onChange={handleSelect}
            renderMenu={renderMenu}
            placeholder="Sök..."
            selected={[]}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};

export default Search;
