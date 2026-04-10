import React, { ChangeEvent } from 'react';
import { Button } from './ui/Button';
import { Form } from './ui/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useSessionStorageState } from '../lib/useSessionStorageState';

type Props = {
    handleChangeFilterString: (booking: ChangeEvent<HTMLInputElement>) => void;
    resetAdvancedFilters: () => void;
    activeFilterCount: number;
    searchText: string;
    children: React.ReactChild | React.ReactChild[];
};

const AdvancedFilters: React.FC<Props> = ({
    handleChangeFilterString,
    resetAdvancedFilters,
    activeFilterCount,
    searchText,
    children,
}: Props) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useSessionStorageState('show-advanced-filters', false);

    return (
        <>
            <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex-1 min-w-[200px]">
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Fritextfilter"
                            onChange={handleChangeFilterString}
                            value={searchText}
                        />
                    </Form.Group>
                </div>
                <div>
                    <Form.Group>
                        <Button variant="secondary" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                            <FontAwesomeIcon icon={faFilter} className="mr-1" /> {showAdvancedFilters ? 'Göm' : 'Visa'}{' '}
                            filter
                        </Button>
                        {activeFilterCount > 0 ? (
                            <Button variant="secondary" onClick={() => resetAdvancedFilters()} className="ml-2">
                                <FontAwesomeIcon icon={faRefresh} className="mr-1" /> Återställ filter (
                                {activeFilterCount} {activeFilterCount == 1 ? 'aktivt' : 'aktiva'})
                            </Button>
                        ) : null}
                    </Form.Group>
                </div>
            </div>
            {showAdvancedFilters ? (
                <div className="mb-3">{children}</div>
            ) : null}
        </>
    );
};

export default AdvancedFilters;
