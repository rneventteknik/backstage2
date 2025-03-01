import React from 'react';
import { Form, FormControlSelect, FormGroup, FormLabel } from '../ui/Form';

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
                    <FormGroup >
                        <div className="d-flex justify-content-end">
                            <div>
                                <FormLabel className="text-right" htmlFor="viewcount">Antal {entityTypeDisplayName} att visa</FormLabel>
                            </div>
                            <div>
                                <FormControlSelect
                                    name="viewcount"
                                    className="ml-2"
                                    size="sm"
                                    defaultValue={viewCount.toString()}
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
                                </FormControlSelect>
                            </div>
                        </div>
                    </FormGroup>
                </Form>
            </div>
        </div>
    </>
);

export default TableFooterWithViewCount;
