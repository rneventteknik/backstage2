import React, { useState } from 'react';
import * as Typeahead from 'react-bootstrap-typeahead';
import { useRouter } from 'next/router';
import { SearchResult } from '../../models/misc/SearchResult';
import { groupBy, getResponseContentOrError } from '../../lib/utils';
import styles from './Search.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCube, faUser, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { IEquipmentObjectionModel, IEventObjectionModel, IUserObjectionModel } from '../../models/objection-models';
import { useNotifications } from '../../lib/useNotifications';
import { toUser } from '../../lib/mappers/user';
import { toEvent } from '../../lib/mappers/event';
import { toEquipment } from '../../lib/mappers/equipment';
import { Badge } from 'react-bootstrap';
import { BaseEntityWithName } from '../../models/interfaces/BaseEntity';

enum ResultType {
    EVENT,
    EQUIPMENT,
    USER,
}
interface SearchResultViewModel extends BaseEntityWithName {
    type: ResultType;
    url: string;
}
interface HasIndex {
    index: number;
}

const Search: React.FC = () => {
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

    // The search API returns the search result as an object with seperate lists for events, equipment and
    // users, but the dropdown component requires all values in a single list and the type as a parameter.
    const convertSearchResultsForDisplay = (results: SearchResult): SearchResultViewModel[] => {
        return ([] as SearchResultViewModel[])
            .concat(
                results.events.map((event) => ({
                    type: ResultType.EVENT,
                    url: '/events/' + event.id,
                    ...toEvent(event),
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

    function ResultSection<T extends SearchResultViewModel & HasIndex>({
        results,
        heading,
        icon,
        state,
    }: ResultSectionProps<T>): React.ReactElement {
        const getDescription = (entity: T, highlightText: string) => {
            switch (entity.type) {
                case ResultType.USER:
                    const user = (entity as unknown) as IUserObjectionModel;
                    return (
                        <small>
                            <Typeahead.Highlighter search={highlightText}>{user.nameTag}</Typeahead.Highlighter> /{' '}
                            <Typeahead.Highlighter search={highlightText}>{user.emailAddress}</Typeahead.Highlighter>
                        </small>
                    );

                case ResultType.EQUIPMENT:
                    const equipment = (entity as unknown) as IEquipmentObjectionModel;
                    return (
                        <small>
                            <Typeahead.Highlighter search={highlightText}>{equipment.nameEN}</Typeahead.Highlighter>{' '}
                            {equipment.categories?.map((x) => (
                                <>
                                    <Badge key={x.id} variant="dark">
                                        {x.name}
                                    </Badge>{' '}
                                </>
                            ))}
                        </small>
                    );

                case ResultType.EVENT:
                    const event = (entity as unknown) as IEventObjectionModel;
                    return (
                        <small>
                            <Typeahead.Highlighter search={highlightText}>
                                {event.contactPersonName}
                            </Typeahead.Highlighter>
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
                        >
                            <Typeahead.Highlighter search={state.text}>{entity.name}</Typeahead.Highlighter>
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
    }

    const renderMenu = (
        results: Typeahead.TypeaheadResult<SearchResultViewModel>[],
        menuProps: Typeahead.TypeaheadMenuProps<SearchResultViewModel>,
        state: Typeahead.TypeaheadState<SearchResultViewModel>,
    ) => {
        const resultWithIndex = results.map((res, index) => ({ index: index, ...res }));
        const res = groupBy(resultWithIndex, (x) => x.type);

        return (
            <Typeahead.Menu {...menuProps} className={styles.menu}>
                <ResultSection heading="Bokningar" icon={faCalendarDay} results={res[ResultType.EVENT]} state={state} />

                <Typeahead.Menu.Divider />
                <ResultSection heading="Utrustning" icon={faCube} results={res[ResultType.EQUIPMENT]} state={state} />

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
        />
    );
};

export default Search;