import React from 'react';
import { Form } from '../ui/Form';

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
        <hr className="border-bs-2 my-0" />
        <div className="flex items-center px-4 py-3">
            <div className="flex-grow">
                <p className="text-muted text-sm">
                    Visar {Math.min(viewCount, totalCount)} {entityTypeDisplayName} av {totalCount}.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <label className="text-sm text-muted" htmlFor="viewcount">
                    Antal {entityTypeDisplayName} att visa
                </label>
                <Form.Control
                    as="select"
                    id="viewcount"
                    name="viewcount"
                    size="sm"
                    defaultValue={viewCount}
                    onChange={(e) => setViewCount(Number((e.target as HTMLInputElement).value))}
                    className="w-24"
                >
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                    <option value={totalCount}>Alla {totalCount} {entityTypeDisplayName}</option>
                </Form.Control>
            </div>
        </div>
    </>
);

export default TableFooterWithViewCount;
