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
                {bookingsWithPotentialProblems.length === 0 && <p>Inga bokningar med potentiella problem.</p>}
                {bookingsWithPotentialProblems.length > 0 && (
                    <ul>
                        {bookingsWithPotentialProblems.map((item) => (
                            <li key={item.booking.id}>
                                {item.booking.name}
                                <ul>
                                    {item.shouldBeBooked && <li>Skulle ha varit bokad</li>}
                                    {item.shouldBeDone && <li>Skulle ha varit slutförd</li>}
                                    {item.shouldBeOut.length > 0 && (
                                        <li>
                                            Skulle ha hämtats:
                                            <ul>
                                                {item.shouldBeOut.map((eq) => (
                                                    <li key={eq.id}>{eq.name}</li>
                                                ))}
                                            </ul>
                                        </li>
                                    )}
                                    {item.shouldBeIn.length > 0 && (
                                        <li>
                                            Skulle ha lämnats tillbaka:
                                            <ul>
                                                {item.shouldBeIn.map((eq) => (
                                                    <li key={eq.id}>{eq.name}</li>
                                                ))}
                                            </ul>
                                        </li>
                                    )}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
                    
            </CollapsibleCard>
        </>
    );
};

export default BookingsWithPotentialProblemsCard;
