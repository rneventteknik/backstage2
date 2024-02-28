import React from 'react';
import { Form } from 'react-bootstrap';
import { addVAT, formatCurrency } from '../../lib/pricingUtils';
import currency from 'currency.js';

type Props = {
    price: currency | null | undefined;
    text?: string;
};

const PriceWithVATPreview: React.FC<Props> = ({ price, text = 'Pris inklusive moms: ' }: Props) => {
    return (
        <Form.Text className="text-muted">
            {text}
            {price != null && price != undefined ? formatCurrency(addVAT(price)) : '-'}.
        </Form.Text>
    );
};

export default PriceWithVATPreview;
