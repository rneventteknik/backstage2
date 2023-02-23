import React, { ChangeEvent } from 'react';
import { Button, Col, Collapse, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useLocalStorageState } from '../lib/useLocalStorageState';

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
    const [showAdvancedFilters, setShowAdvancedFilters] = useLocalStorageState('show-advanced-filters', false);

    return (
        <>
            <Form.Row>
                <Col>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Fritextfilter"
                            onChange={handleChangeFilterString}
                            value={searchText}
                        />
                    </Form.Group>
                </Col>
                <Col md="auto">
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
                </Col>
            </Form.Row>
            <Collapse in={showAdvancedFilters}>
                <div>{children}</div>
            </Collapse>
        </>
    );
};

export default AdvancedFilters;
