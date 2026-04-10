import React from 'react';
import { addVAT, formatCurrency } from '../../lib/pricingUtils';
import currency from 'currency.js';

type Props = {
    price: currency | null | undefined;
    text?: string;
};

const PriceWithVATPreview: React.FC<Props> = ({ price, text = 'Pris inklusive moms: ' }: Props) => {
    return (
        <small className="block mt-1 text-xs text-muted">
            {text}
            {price != null && price != undefined ? formatCurrency(addVAT(price)) : '-'}.
        </small>
    );
};

export default PriceWithVATPreview;
