import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { getStatusName } from '../lib/utils';
import BookingTypeTag from './utils/BookingTypeTag';
import { Booking } from '../models/interfaces';
import Link from 'next/link';

type Props = {
    title: string;
    bookings: Booking[] | undefined;
};

const SmallBookingList: React.FC<Props> = ({ title, bookings }: Props) => (
    <Card className="mb-3">
        <Card.Header>{title}</Card.Header>
        <ListGroup variant="flush">
            {bookings?.map((booking) => (
                <ListGroup.Item key={booking.id} className="d-flex">
                    <span className="flex-grow-1">
                        {booking.name} <BookingTypeTag booking={booking} />
                        <br />
                        <span className="text-muted">{getStatusName(booking.status)}</span>
                    </span>
                    <Link href={'/bookings/' + booking.id}>Visa bokning</Link>
                </ListGroup.Item>
            ))}

            {bookings?.length === 0 ? (
                <ListGroup.Item className="text-center font-italic text-muted">Inga bokningar</ListGroup.Item>
            ) : null}
        </ListGroup>
    </Card>
);

export default SmallBookingList;
