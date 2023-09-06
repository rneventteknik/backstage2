import React from 'react';
import { BookingViewModel } from '../../models/interfaces';
import { getLanguageName, getPaymentStatusName, getStatusColor, getStatusName } from '../../lib/utils';
import { Language } from '../../models/enums/Language';
import { Card, Badge } from 'react-bootstrap';
import { getNumberOfBookingDays, getNumberOfEventHours } from '../../lib/datetimeUtils';
import BookingStatusTag from '../utils/BookingStatusTag';
import BookingTypeTag from '../utils/BookingTypeTag';
import RentalStatusTag from '../utils/RentalStatusTag';
import FixedPriceStatusTag from '../utils/FixedPriceStatusTag';

type Props = {
    booking: BookingViewModel;
    className?: string;
    showName?: boolean;
};

const BookingInfoSection: React.FC<Props> = ({ booking, className, showName = true }: Props) => {
    return (
        <Card className={className}>
            <Card.Header
                className="p-0"
                title={getStatusName(booking.status)}
                style={{ backgroundColor: getStatusColor(booking.status), height: 5 }}
            ></Card.Header>
            <Card.Header>
                {showName ? <div style={{ fontSize: '1.6em' }}>{booking.name}</div> : null}
                <BookingStatusTag booking={booking} />
                <BookingTypeTag booking={booking} className="ml-1" />
                <RentalStatusTag booking={booking} className="ml-1" />
                <Badge variant="dark" className="ml-1">
                    {getPaymentStatusName(booking.paymentStatus)}
                </Badge>
                {booking.language !== Language.SV ? (
                    <Badge variant="dark" className="ml-1">
                        {getLanguageName(booking.language)}
                    </Badge>
                ) : null}
                <FixedPriceStatusTag booking={booking} className="ml-1" />
                <div className="text-muted mt-2"> {booking.customerName}</div>
                <div className="text-muted">
                    {getNumberOfBookingDays(booking) ? `${getNumberOfBookingDays(booking)} debiterade dagar / ` : null}
                    {getNumberOfEventHours(booking)} fakturerade timmar
                </div>
                <div className="text-muted">{booking.displayUsageInterval}</div>
            </Card.Header>
        </Card>
    );
};

export default BookingInfoSection;
