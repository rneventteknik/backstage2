import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';

type Props = {
    viewCount: number;
    totalCount: number;
    setViewCount: (viewCount: number) => unknown;
    entityTypeDisplayName: string;
};

const TableFooterWithViewCount: React.FC<Props> = ({
    viewCount,
    totalCount,
    setViewCount,
    entityTypeDisplayName,
}: Props) => (
    <>
        <hr />
        <Row className="my-3 px-2">
            <Col>
                <p className="text-muted">
                    Visar {Math.min(viewCount, totalCount)} {entityTypeDisplayName} av {totalCount}.
                </p>
            </Col>
            <Col md="auto">
                <Form inline>
                    <Form.Group controlId="viewcount">
                        <Form.Label>Antal {entityTypeDisplayName} att visa</Form.Label>
                        <Form.Control
                            as="select"
                            name="viewcount"
                            className="ml-2"
                            size="sm"
                            defaultValue={viewCount}
                            onChange={(e) => setViewCount(Number(e.target.value))}
                        >
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                            <option value="1000">1000</option>
                            <option value={totalCount}>
                                Alla {totalCount} {entityTypeDisplayName}
                            </option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    </>
);

export default TableFooterWithViewCount;
