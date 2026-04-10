import React, { useRef, useState } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
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

const inputBase =
    'bg-bs-4 border border-bs-4 text-body placeholder-muted px-3 py-1.5 text-sm focus:outline-none focus:border-bs-7 disabled:opacity-60 w-full';

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

type Props = {
    onFocus?: () => unknown;
    onBlur?: () => unknown;
};

const Search: React.FC<Props> = ({ onFocus, onBlur }: Props) => {
    const router = useRouter();
    const { showErrorMessage } = useNotifications();

    const [searchResult, setSearchResult] = useState<SearchResultViewModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState('');

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

    const handleSelect = (entity: SearchResultViewModel | null) => {
        if (entity) {
            router.push(entity.url);
        }
        setQuery('');
        setSearchResult([]);
    };

    type ResultSectionProps = {
        results: SearchResultViewModel[] | undefined;
        heading: string;
        icon: IconDefinition;
    };

    const ResultSection = ({ results, heading, icon }: ResultSectionProps): React.ReactElement => {
        const getDescription = (entity: SearchResultViewModel, highlightText: string) => {
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
                            {equipment.tags?.map((x) => <EquipmentTagDisplay tag={x} key={x.id} className="me-1" />)}
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
                                <EquipmentTagDisplay tag={x} key={x.id} className="me-1" />
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
                <div className={styles.menuHeader}>
                    <FontAwesomeIcon icon={icon} /> {heading}
                </div>
                {results && results.length > 0 ? (
                    results.map((entity) => (
                        <ComboboxOption key={entity.id} value={entity} className={styles.dropdownItem}>
                            <SplitHighlighter search={query} textToHighlight={entity.name} />
                            <div>{getDescription(entity, query)}</div>
                        </ComboboxOption>
                    ))
                ) : (
                    <div className={styles.menuHeader}>
                        <small>{isLoading ? 'Laddar...' : 'Inga matchingar'}</small>
                    </div>
                )}
            </>
        );
    };

    const res = groupBy(searchResult, (x) => x.type);

    return (
        <Combobox as="div" className="relative" value={null} onChange={handleSelect} immediate>
            <ComboboxInput
                displayValue={() => ''}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Sök..."
                onFocus={onFocus}
                onBlur={onBlur}
                className={inputBase}
            />
            {query.length > 0 && (
                <ComboboxOptions className={styles.menu}>
                    <ResultSection heading="Bokningar" icon={faCalendarDay} results={res[ResultType.BOOKING]} />
                    <hr className={styles.divider} />
                    <ResultSection heading="Utrustning" icon={faCube} results={res[ResultType.EQUIPMENT]} />
                    <hr className={styles.divider} />
                    <ResultSection
                        heading="Utrustningspaket"
                        icon={faCubes}
                        results={res[ResultType.EQUIPMENT_PACKAGE]}
                    />
                    <hr className={styles.divider} />
                    <ResultSection heading="Användare" icon={faUser} results={res[ResultType.USER]} />
                </ComboboxOptions>
            )}
        </Combobox>
    );
};

export default Search;
