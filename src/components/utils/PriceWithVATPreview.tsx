import React from 'react';
import { Form } from 'react-bootstrap';
import { formatNumberAsCurrency, addVAT } from '../../lib/pricingUtils';

type Props = {
    price: number | null | undefined;
    text?: string;
};

const PriceWithVATPreview: React.FC<Props> = ({ price, text = 'Pris inklusive moms: ' }: Props) => {
    return (
        <Form.Text className="text-muted">
            {text}
            {price != null && price != undefined ? formatNumberAsCurrency(addVAT(price)) : '-'}.
        </Form.Text>
    );
};

export default PriceWithVATPreview;
