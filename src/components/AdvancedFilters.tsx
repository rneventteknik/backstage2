import React, { ChangeEvent } from 'react';
import { Button, Col, Collapse, Form, Row } from 'react-bootstrap';
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
            <Row>
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
                            <FontAwesomeIcon icon={faFilter} className="me-1" /> {showAdvancedFilters ? 'Göm' : 'Visa'}{' '}
                            filter
                        </Button>
                        {activeFilterCount > 0 ? (
                            <Button variant="secondary" onClick={() => resetAdvancedFilters()} className="ms-2">
                                <FontAwesomeIcon icon={faRefresh} className="me-1" /> Återställ filter (
                                {activeFilterCount} {activeFilterCount == 1 ? 'aktivt' : 'aktiva'})
                            </Button>
                        ) : null}
                    </Form.Group>
                </Col>
            </Row>
            <Collapse in={showAdvancedFilters}>
                <div>{children}</div>
            </Collapse>
        </>
    );
};

export default AdvancedFilters;
