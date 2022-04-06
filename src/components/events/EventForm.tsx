import React, { FormEvent, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Event } from '../../models/interfaces';
import { IEventObjectionModel } from '../../models/objection-models';
import {
    getAccountKindName,
    getEventTypeName,
    getPricePlanName,
    getSalaryStatusName,
    getStatusName,
} from '../../lib/utils';
import useSwr from 'swr';
import { EventType } from '../../models/enums/EventType';
import ActivityIndicator from '../utils/ActivityIndicator';
import { Status } from '../../models/enums/Status';
import { AccountKind } from '../../models/enums/AccountKind';
import { PricePlan } from '../../models/enums/PricePlan';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import { usersFetcher } from '../../lib/fetchers';
import RequiredIndicator from '../utils/RequiredIndicator';

type Props = {
    handleSubmitEvent: (event: Partial<IEventObjectionModel>) => void;
    event: Partial<Event>;
    formId: string;
    isNewBooking?: boolean;
};

const EventForm: React.FC<Props> = ({ handleSubmitEvent, event: booking, formId, isNewBooking }: Props) => {
    const [validated, setValidated] = useState(false);

    const { data: users } = useSwr('/api/users', usersFetcher);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;

        // Check that the type, status, account type and price plan are valid
        if (!form.bookingType?.value || form.bookingType?.value == '') {
            form.bookingType.setCustomValidity('Inkorrekt prisplan');
        } else {
            form.bookingType.setCustomValidity('');
        }
        if (!form.status?.value || form.status?.value == '') {
            form.status.setCustomValidity('Inkorrekt prisplan');
        } else {
            form.status.setCustomValidity('');
        }
        if (!form.accountKind?.value || form.accountKind?.value == '') {
            form.accountKind.setCustomValidity('Inkorrekt prisplan');
        } else {
            form.accountKind.setCustomValidity('');
        }
        if (!form.pricePlan?.value || form.pricePlan?.value == '') {
            form.pricePlan.setCustomValidity('Inkorrekt prisplan');
        } else {
            form.pricePlan.setCustomValidity('');
        }

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const modifiedBooking: Partial<IEventObjectionModel> = {
            id: booking.id,
            name: form.bookingName.value,
            eventType: form.bookingType.value,
            status: form.status.value,
            location: form.location.value,
            ownerUser: form.ownerUser?.value,
            pricePlan: form.pricePlan.value,
            accountKind: form.accountKind.value,
            contactPersonName: form.contactPersonName.value,
            contactPersonPhone: form.contactPersonPhone.value,
            contactPersonEmail: form.contactPersonEmail.value,
            customerName: form.customerName.value,
            note: form.note.value,
            invoiceHogiaId: form.invoiceHogiaId?.value,
            invoiceAddress: form.invoiceAddress?.value,
            invoiceTag: form.invoiceTag?.value,
            invoiceNumber: form.invoiceNumber?.value,
            salaryStatus: form.salaryStatus?.value,
            returnalNote: form.returnalNote?.value,
            calendarEventId: form.calendarEventId?.value,
        };

        handleSubmitEvent(modifiedBooking);
    };
    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formName">
                        <Form.Label>Namn<RequiredIndicator /></Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="BETAspexet"
                            name="bookingName"
                            defaultValue={booking.name}
                        />
                    </Form.Group>
                </Col>
                <Col lg="3" md="6" sm="6">
                    <Form.Group controlId="formEventType">
                        <Form.Label>Bokningstyp<RequiredIndicator /></Form.Label>
                        <Form.Control as="select" name="bookingType" defaultValue={booking.eventType}>
                            {booking.eventType ? null : <option value="">Välj bokningstyp</option>}
                            <option value={EventType.GIG}>{getEventTypeName(EventType.GIG)}</option>
                            <option value={EventType.RENTAL}>{getEventTypeName(EventType.RENTAL)}</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col lg="3" md="6" sm="6">
                    <Form.Group controlId="formStatus">
                        <Form.Label>Bokningsstatus<RequiredIndicator /></Form.Label>
                        <Form.Control as="select" name="status" defaultValue={booking.status} disabled={isNewBooking}>
                            <option value={Status.DRAFT}>{getStatusName(Status.DRAFT)}</option>
                            {isNewBooking ? null : 
                                <>
                                    <option value={Status.BOOKED}>{getStatusName(Status.BOOKED)}</option>
                                    <option value={Status.OUT}>{getStatusName(Status.OUT)}</option>
                                    <option value={Status.ONGOING}>{getStatusName(Status.ONGOING)}</option>
                                    <option value={Status.RETURNED}>{getStatusName(Status.RETURNED)}</option>
                                    <option value={Status.DONE}>{getStatusName(Status.DONE)}</option>
                                    <option value={Status.INVOICED}>{getStatusName(Status.INVOICED)}</option>
                                    <option value={Status.PAID}>{getStatusName(Status.PAID)}</option>
                                    <option value={Status.CANCELED}>{getStatusName(Status.CANCELED)}</option>
                                </>
                            }
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formLocation">
                        <Form.Label>Beställare</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="THS"
                            name="customerName"
                            defaultValue={booking.customerName}
                        />
                    </Form.Group>
                </Col>
                <Col lg="6">
                    <Form.Group controlId="formOwnerUser">
                        <Form.Label>Ansvarig medlem</Form.Label>
                        {users ? (
                            <Form.Control as="select" name="ownerUser" defaultValue={booking.ownerUser?.id}>
                                <option value="">Inte tilldelat</option>
                                {users?.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </Form.Control>
                        ) : (
                            <ActivityIndicator />
                        )}
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formLocation">
                        <Form.Label>Plats</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nya Matsalen, Nymble"
                            name="location"
                            defaultValue={booking.location}
                        />
                    </Form.Group>
                </Col>
                <Col lg="3" md="6" sm="6">
                    <Form.Group controlId="formAccountKind">
                        <Form.Label>Kontotyp<RequiredIndicator /></Form.Label>
                        <Form.Control as="select" name="accountKind" defaultValue={booking.accountKind} required>
                            {booking.accountKind ? null : <option value="">Välj kontotyp</option>}
                            <option value={AccountKind.EXTERNAL}>{getAccountKindName(AccountKind.EXTERNAL)}</option>
                            <option value={AccountKind.INTERNAL}>{getAccountKindName(AccountKind.INTERNAL)}</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col lg="3" md="6" sm="6">
                    <Form.Group controlId="formPricePlan">
                        <Form.Label>Prisplan<RequiredIndicator /></Form.Label>
                        <Form.Control as="select" name="pricePlan" defaultValue={booking.pricePlan} required>
                            {booking.pricePlan ? null : <option value="">Välj prisplan</option>}
                            <option value={PricePlan.THS}>{getPricePlanName(PricePlan.THS)}</option>
                            <option value={PricePlan.EXTERNAL}>{getPricePlanName(PricePlan.EXTERNAL)}</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group controlId="formNote">
                        <Form.Label>Anteckningar</Form.Label>
                        <Form.Control as="textarea" name="note" rows={6} defaultValue={booking.note} />
                    </Form.Group>
                </Col>
            </Row>
            <h6>Kontaktperson</h6>
            <hr />
            <Row>
                <Col lg="4" md="4">
                    <Form.Group controlId="formContactPersonName">
                        <Form.Label>Namn<RequiredIndicator /></Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Mats Matsson"
                            name="contactPersonName"
                            defaultValue={booking.contactPersonName}
                        />
                    </Form.Group>
                </Col>
                <Col lg="4" md="4">
                    <Form.Group controlId="formContactPersonEmail">
                        <Form.Label>Email<RequiredIndicator /></Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="mats.matsson@mats.se"
                            name="contactPersonEmail"
                            defaultValue={booking.contactPersonEmail}
                        />
                    </Form.Group>
                </Col>
                <Col lg="4" md="4">
                    <Form.Group controlId="formContactPersonPhone">
                        <Form.Label>Telefon</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="070 000 00 00"
                            name="contactPersonPhone"
                            defaultValue={booking.contactPersonPhone}
                        />
                    </Form.Group>
                </Col>
            </Row>
            {!booking || isNewBooking ? null : (
                <>
                    <h6>Fakturainformation</h6>
                    <hr />
                    <Row>
                        <Col lg="4" md="4">
                            <Form.Group controlId="formInvoiceHogiaId">
                                <Form.Label>Hogia ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="1234"
                                    name="invoiceHogiaId"
                                    defaultValue={booking.invoiceHogiaId}
                                />
                            </Form.Group>
                        </Col>
                        <Col lg="4" md="4">
                            <Form.Group controlId="formInvoiceTag">
                                <Form.Label>Fakturamärkning</Form.Label>
                                <Form.Control type="text" name="invoiceTag" defaultValue={booking.invoiceTag} />
                            </Form.Group>
                        </Col>
                        <Col lg="4" md="4">
                            <Form.Group controlId="formInvoiceNumber">
                                <Form.Label>Fakturanummer</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="22001"
                                    name="invoiceNumber"
                                    defaultValue={booking.invoiceNumber}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="formInvoiceAddress">
                                <Form.Label>Fakturaadress</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="invoiceAddress"
                                    rows={3}
                                    defaultValue={booking.invoiceAddress}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <h6>Övrigt</h6>
                    <hr />
                    <Row>
                        <Col>
                            <Form.Group controlId="formSalaryStatus">
                                <Form.Label>Lönestatus</Form.Label>
                                <Form.Control as="select" name="salaryStatus" defaultValue={booking.salaryStatus}>
                                    <option value={SalaryStatus.NOT_SENT}>
                                        {getSalaryStatusName(SalaryStatus.NOT_SENT)}
                                    </option>
                                    <option value={SalaryStatus.SENT}>{getSalaryStatusName(SalaryStatus.SENT)}</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group controlId="formReturnalNote">
                                <Form.Label>Återlämningsanmärkning</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="returnalNote"
                                    rows={6}
                                    defaultValue={booking.returnalNote}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </>
            )}

            <Form.Control
                type="hidden"
                name="calendarEventId"
                defaultValue={booking?.calendarEventId}
            />
        </Form>
    );
};

export default EventForm;
