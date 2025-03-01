import React, { ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useSessionStorageState } from '../lib/useSessionStorageState';
import { Col, Row } from './ui/Row';
import { FormControl, FormGroup } from './ui/Form';
import { Button } from './ui/Button';

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
            <Row>
                <Col>
                    <FormGroup>
                        <FormControl
                            placeholder="Fritextfilter"
                            onChange={handleChangeFilterString}
                            value={searchText}
                        />
                    </FormGroup>
                </Col>
                <Col>
                    <FormGroup>
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
                    </FormGroup>
                </Col>
            </Row>
            {/* <Collapse in={showAdvancedFilters}>
                <div>{children}</div>
            </Collapse> TODO */}
            {showAdvancedFilters ? <div>{children}</div> : null}
        </>
    );
};

export default AdvancedFilters;
