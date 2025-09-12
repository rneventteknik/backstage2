import React from 'react';
import { Booking } from '../models/interfaces';
import CollapsibleCard from './utils/CollapsibleCard';
import { getBookingsWithPotentialProblems } from '../lib/bookingsWithPotentialProblemsUtils';

type Props = {
    bookings: Booking[];
};

const BookingsWithPotentialProblemsCard: React.FC<Props> = ({ bookings }: Props) => {
    const bookingsWithPotentialProblems = getBookingsWithPotentialProblems(bookings);

    return (
        <>
            <CollapsibleCard title={'Bokningar med potentiella problem'} defaultOpen={true}>
                <h1>Should be booked</h1>
                <ul>
                    {bookingsWithPotentialProblems.shouldBeBooked.map((x) => (
                        <li key={x.id}>{x.name}</li>
                    ))}
                </ul>

                <h1>Should be done</h1>
                <ul>
                    {bookingsWithPotentialProblems.shouldBeDone.map((x) => (
                        <li key={x.id}>{x.name}</li>
                    ))}
                </ul>

                <h1>Should be out</h1>
                <ul>
                    {bookingsWithPotentialProblems.shouldBeOut.map((x) => (
                        <li key={x.booking.id + '-' + x.equipmentList.id}>
                            {x.equipmentList.name} ({x.booking.name})
                        </li>
                    ))}
                </ul>

                <h1>Should be in</h1>
                <ul>
                    {bookingsWithPotentialProblems.shouldBeIn.map((x) => (
                        <li key={x.booking.id + '-' + x.equipmentList.id}>
                            {x.equipmentList.name} ({x.booking.name})
                        </li>
                    ))}
                </ul>
            </CollapsibleCard>
        </>
    );
};

export default BookingsWithPotentialProblemsCard;
