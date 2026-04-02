import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { addVAT, BookingPriceSummary, formatCurrency, getVAT } from '../../lib/pricingUtils';
import currency from 'currency.js';

type EquipmentListDetail = {
    id: number | string;
    name: string;
    price: currency;
};

type Props = {
    bookingPriceSummary: BookingPriceSummary;
    equipmentListDetails?: EquipmentListDetail[];
};

const BookingPriceSummaryDisplay: React.FC<Props> = ({
    bookingPriceSummary: snapshot,
    equipmentListDetails,
}: Props) => {
    const { equipmentPrice, timeEstimatePrice, timeReportsPrice, fixedPrice } = snapshot;

    const priceWithEstimate = equipmentPrice.add(timeEstimatePrice);
    const priceWithReports = timeReportsPrice !== null ? equipmentPrice.add(timeReportsPrice) : null;

    const equipmentListRows = equipmentListDetails ?? [
        { name: 'Utrustningslistor totalt', price: equipmentPrice } as EquipmentListDetail,
    ];

    return (
        <ListGroup variant="flush">
            {equipmentListRows.map((list) => (
                <ListGroup.Item className="d-flex" key={list.id}>
                    <span className="flex-grow-1">{list.name}</span>
                    <span>{formatCurrency(addVAT(list.price))}</span>
                </ListGroup.Item>
            ))}
            <ListGroup.Item className="d-flex">
                <span className="flex-grow-1">Estimerad personalkostnad</span>
                <span>{formatCurrency(addVAT(timeEstimatePrice))}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex">
                <strong className="flex-grow-1">Pris med estimerad personalkostnad</strong>
                <strong>{formatCurrency(addVAT(priceWithEstimate))}</strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex">
                <em className="flex-grow-1 pl-4">varav moms (25%)</em>
                <em>{formatCurrency(getVAT(priceWithEstimate))}</em>
            </ListGroup.Item>

            {timeReportsPrice !== null && priceWithReports !== null ? (
                <>
                    <ListGroup.Item className="d-flex">
                        <span className="flex-grow-1">Faktisk personalkostnad</span>
                        <span>{formatCurrency(addVAT(timeReportsPrice))}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex">
                        <strong className="flex-grow-1">Pris med faktisk personalkostnad</strong>
                        <strong>{formatCurrency(addVAT(priceWithReports))}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex">
                        <em className="flex-grow-1 pl-4">varav moms (25%)</em>
                        <em>{formatCurrency(getVAT(priceWithReports))}</em>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex">
                        <span className="flex-grow-1">Skillnad mot estimerad personalkostnad</span>
                        <span>{formatCurrency(addVAT(priceWithReports.subtract(priceWithEstimate)), true)}</span>
                    </ListGroup.Item>
                </>
            ) : null}

            {fixedPrice !== null ? (
                <>
                    <ListGroup.Item className="d-flex">
                        <strong className="flex-grow-1">Fast pris</strong>
                        <strong>{formatCurrency(addVAT(fixedPrice))}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex">
                        <em className="flex-grow-1 pl-4">varav moms (25%)</em>
                        <em>{formatCurrency(getVAT(fixedPrice))}</em>
                    </ListGroup.Item>
                    {priceWithReports !== null ? (
                        <ListGroup.Item className="d-flex">
                            <span className="flex-grow-1">Skillnad mot pris med faktisk personalkostnad</span>
                            <span>{formatCurrency(addVAT(fixedPrice.subtract(priceWithReports)), true)}</span>
                        </ListGroup.Item>
                    ) : (
                        <ListGroup.Item className="d-flex">
                            <span className="flex-grow-1">Skillnad mot pris med estimerad personalkostnad</span>
                            <span>{formatCurrency(addVAT(fixedPrice.subtract(priceWithEstimate)), true)}</span>
                        </ListGroup.Item>
                    )}
                </>
            ) : null}
        </ListGroup>
    );
};

export default BookingPriceSummaryDisplay;
