import React, { useState } from 'react';
import { Booking } from '../../models/interfaces';
import { Alert, Button, Card } from 'react-bootstrap';
import { getBookingsWithPotentialProblems } from '../../lib/bookingsWithPotentialProblemsUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faWarning } from '@fortawesome/free-solid-svg-icons';
import { countNotNullorEmpty } from '../../lib/utils';
import { formatDatetime } from '../../lib/datetimeUtils';

type Props = {
    booking: Booking;
};

const BookingPotentialProblemsSection: React.FC<Props> = ({ booking }: Props) => {
    const [showContent, setShowContent] = useState(true);
    const result = getBookingsWithPotentialProblems([booking])[0] ?? null;

    if (!result) {
        return null;
    }

    return (
        <Card className="mb-3">
            <Card.Header className="p-0 bg-warning" style={{ height: 5 }}></Card.Header>
            <Card.Header>
                <div className="d-flex">
                    <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                        <FontAwesomeIcon className="mr-2" icon={faWarning} />
                        Potentiella problem
                    </div>
                    <div className="d-flex">
                        <Button className="mr-2" variant="" onClick={() => setShowContent(!showContent)}>
                            <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                        </Button>
                    </div>
                </div>
            </Card.Header>
            {showContent ? (
                <Card.Body>
                    {result.shouldBeBooked ? (
                        <p className="mb-3">
                            Inte markerat som bokad
                            <span className="text-muted d-block">
                                Denna bokning lämnas ut {formatDatetime(result.booking.equipmentOutDatetime)} och är
                                fortfarande inte markerad som bokad
                            </span>
                        </p>
                    ) : null}
                    {result.shouldBeDone ? (
                        <p className="mb-3">
                            Inte klarmarkerad
                            <span className="text-muted d-block">
                                Denna bokning återlämnades {formatDatetime(result.booking.equipmentInDatetime)} och är
                                fortfarande inte klarmarkerad
                            </span>
                        </p>
                    ) : null}
                    {result.shouldBeOut.length > 0 ? (
                        <p className="mb-3">
                            Inte utlämnad
                            <span className="text-muted d-block">
                                Denna bokning har utrustningslistor som borde ha lämnats ut men som inte markerats som
                                utlämnade ({result.shouldBeOut.map((x) => x.name).join(', ')})
                            </span>
                        </p>
                    ) : null}
                    {result.shouldBeIn.length > 0 ? (
                        <p className="mb-3">
                            Inte återlämnad
                            <span className="text-muted d-block">
                                Denna bokning har utrustningslistor som borde ha återlämnats men som inte markerats som
                                återlämnade ({result.shouldBeIn.map((x) => x.name).join(', ')})
                            </span>
                        </p>
                    ) : null}
                </Card.Body>
            ) : null}
        </Card>
    );
};

export default BookingPotentialProblemsSection;
