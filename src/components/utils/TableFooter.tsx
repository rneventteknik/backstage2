import React from 'react';
import { Form } from 'react-bootstrap';

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
        <div className="d-flex">
            <div>
                <p className="text-muted">
                    Visar {Math.min(viewCount, totalCount)} {entityTypeDisplayName} av {totalCount}.
                </p>
            </div>
            <div className="flex-grow-1 ml-2">
                <Form>
                    <Form.Group controlId="viewcount">
                        <div className="d-flex justify-content-end">
                            <div>
                                <Form.Label className="text-right">Antal {entityTypeDisplayName} att visa</Form.Label>
                            </div>
                            <div>
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
                                    <option value="200">200</option>
                                    <option value="500">500</option>
                                    <option value="1000">1000</option>
                                    <option value={totalCount}>
                                        Alla {totalCount} {entityTypeDisplayName}
                                    </option>
                                </Form.Control>
                            </div>
                        </div>
                    </Form.Group>
                </Form>
            </div>
        </div>
    </>
);

export default TableFooterWithViewCount;
