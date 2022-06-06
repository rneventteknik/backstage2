import React, { FormEvent, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Booking } from '../../models/interfaces';
import { IBookingObjectionModel } from '../../models/objection-models';
import {
    getAccountKindName,
    getBookingTypeName,
    getPaymentStatusName,
    getPricePlanName,
    getSalaryStatusName,
    getStatusName,
    replaceEmptyStringWithNull,
    toIntOrUndefined,
} from '../../lib/utils';
import useSwr from 'swr';
import { BookingType } from '../../models/enums/BookingType';
import ActivityIndicator from '../utils/ActivityIndicator';
import { Status } from '../../models/enums/Status';
import { AccountKind } from '../../models/enums/AccountKind';
import { PricePlan } from '../../models/enums/PricePlan';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import { usersFetcher } from '../../lib/fetchers';
import RequiredIndicator from '../utils/RequiredIndicator';
import { PaymentStatus } from '../../models/enums/PaymentStatus';

type Props = {
    handleSubmitBooking: (booking: Partial<IBookingObjectionModel>) => void;
    booking: Partial<Booking>;
    formId: string;
    isNewBooking?: boolean;
    disableStatusField?: boolean;
};

const BookingForm: React.FC<Props> = ({
    handleSubmitBooking,
    booking,
    formId,
    isNewBooking,
    disableStatusField,
}: Props) => {
    const [validated, setValidated] = useState(false);
    const [status, setStatus] = useState(booking.status);
    const [hoogiaIdIsRequired, setHogiaIdIsRequired] = useState((booking.invoiceAddress?.length ?? 0) === 0);
    const [invoceAddressIsRequired, setInvoceAddressIsRequired] = useState(!booking.invoiceHogiaId);

    const { data: users } = useSwr('/api/users', usersFetcher);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        const getValueFromForm = (key: string): string | undefined => form[key]?.value;

        if (
            !replaceEmptyStringWithNull(getValueFromForm('invoiceHogiaId')) &&
            !replaceEmptyStringWithNull(getValueFromForm('invoiceAddress'))
        ) {
            form.invoiceHogiaId.setCustomValidity('Felaktig fakturainformation');
            form.invoiceAddress.setCustomValidity('Felaktig fakturainformation');
        } else {
            form.invoiceHogiaId.setCustomValidity('');
            form.invoiceAddress.setCustomValidity('');
        }

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const modifiedBooking: Partial<IBookingObjectionModel> = {
            id: booking.id,
            name: getValueFromForm('bookingName'),
            bookingType: toIntOrUndefined(getValueFromForm('bookingType')),
            status: toIntOrUndefined(getValueFromForm('status')),
            location: getValueFromForm('location'),
            ownerUserId: toIntOrUndefined(getValueFromForm('ownerUser')),
            pricePlan: toIntOrUndefined(getValueFromForm('pricePlan')),
            accountKind: toIntOrUndefined(getValueFromForm('accountKind')),
            contactPersonName: getValueFromForm('contactPersonName'),
            contactPersonPhone: getValueFromForm('contactPersonPhone'),
            contactPersonEmail: getValueFromForm('contactPersonEmail'),
            customerName: getValueFromForm('customerName'),
            note: getValueFromForm('note'),
            invoiceHogiaId: !!replaceEmptyStringWithNull(getValueFromForm('invoiceHogiaId'))
                ? parseInt(replaceEmptyStringWithNull(getValueFromForm('invoiceHogiaId')) ?? '0')
                : isNewBooking
                ? undefined
                : null,
            invoiceAddress: getValueFromForm('invoiceAddress'),
            invoiceTag: getValueFromForm('invoiceTag'),
            invoiceNumber: getValueFromForm('invoiceNumber'),
            salaryStatus: toIntOrUndefined(getValueFromForm('salaryStatus')),
            paymentStatus: toIntOrUndefined(getValueFromForm('paymentStatus')),
            returnalNote: getValueFromForm('returnalNote'),
            calendarBookingId: getValueFromForm('calendarBookingId'),
        };

        handleSubmitBooking(modifiedBooking);
    };

    const isFieldRequired = (requiredFromStatus: Status.DRAFT | Status.BOOKED) => {
        if (requiredFromStatus === Status.DRAFT) {
            return true;
        }

        if (requiredFromStatus === Status.BOOKED && status !== Status.DRAFT && status !== Status.CANCELED) {
            return true;
        }

        return false;
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formName">
                        <Form.Label>
                            Namn
                            <RequiredIndicator required={isFieldRequired(Status.DRAFT)} />
                        </Form.Label>
                        <Form.Control
                            required={isFieldRequired(Status.DRAFT)}
                            type="text"
                            placeholder="BETAspexet"
                            name="bookingName"
                            defaultValue={booking.name}
                        />
                    </Form.Group>
                </Col>
                <Col lg="3" md="6" sm="6">
                    <Form.Group controlId="formBookingType">
                        <Form.Label>
                            Bokningstyp
                            <RequiredIndicator required={isFieldRequired(Status.DRAFT)} />
                        </Form.Label>
                        <Form.Control
                            as="select"
                            name="bookingType"
                            defaultValue={booking.bookingType}
                            required={isFieldRequired(Status.DRAFT)}
                        >
                            {booking.bookingType ? null : <option value="">Välj bokningstyp</option>}
                            <option value={BookingType.GIG}>{getBookingTypeName(BookingType.GIG)}</option>
                            <option value={BookingType.RENTAL}>{getBookingTypeName(BookingType.RENTAL)}</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col lg="3" md="6" sm="6">
                    <Form.Group controlId="formStatus">
                        <Form.Label>
                            Bokningsstatus
                            <RequiredIndicator required={isFieldRequired(Status.DRAFT)} />
                        </Form.Label>
                        <Form.Control
                            as="select"
                            name="status"
                            defaultValue={booking.status}
                            disabled={isNewBooking || disableStatusField}
                            onChange={(e) => setStatus(toIntOrUndefined(e.target.value))}
                            required={isFieldRequired(Status.DRAFT)}
                        >
                            <option value={Status.DRAFT}>{getStatusName(Status.DRAFT)}</option>
                            {isNewBooking ? null : (
                                <>
                                    <option value={Status.BOOKED}>{getStatusName(Status.BOOKED)}</option>
                                    <option value={Status.DONE}>{getStatusName(Status.DONE)}</option>
                                    <option value={Status.CANCELED}>{getStatusName(Status.CANCELED)}</option>
                                </>
                            )}
                        </Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formLocation">
                        <Form.Label>
                            Beställare
                            <RequiredIndicator required={isFieldRequired(Status.BOOKED)} />
                        </Form.Label>
                        <Form.Control
                            required={isFieldRequired(Status.BOOKED)}
                            type="text"
                            placeholder="THS"
                            name="customerName"
                            defaultValue={booking.customerName}
                        />
                    </Form.Group>
                </Col>
                <Col lg="6">
                    <Form.Group controlId="formOwnerUser">
                        <Form.Label>
                            Ansvarig medlem
                            <RequiredIndicator required={isFieldRequired(Status.DRAFT)} />
                        </Form.Label>
                        {users ? (
                            <Form.Control
                                as="select"
                                name="ownerUser"
                                defaultValue={booking.ownerUser?.id ?? booking.ownerUserId}
                                required={isFieldRequired(Status.DRAFT)}
                            >
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
                        <Form.Label>
                            Plats
                            <RequiredIndicator required={isFieldRequired(Status.BOOKED)} />
                        </Form.Label>
                        <Form.Control
                            required={isFieldRequired(Status.BOOKED)}
                            type="text"
                            placeholder="Nya Matsalen, Nymble"
                            name="location"
                            defaultValue={booking.location}
                        />
                    </Form.Group>
                </Col>
                <Col lg="3" md="6" sm="6">
                    <Form.Group controlId="formAccountKind">
                        <Form.Label>
                            Kontotyp
                            <RequiredIndicator required={isFieldRequired(Status.BOOKED)} />
                        </Form.Label>
                        <Form.Control
                            as="select"
                            name="accountKind"
                            defaultValue={booking.accountKind}
                            required={isFieldRequired(Status.BOOKED)}
                        >
                            {booking.accountKind ? null : <option value="">Välj kontotyp</option>}
                            <option value={AccountKind.EXTERNAL}>{getAccountKindName(AccountKind.EXTERNAL)}</option>
                            <option value={AccountKind.INTERNAL}>{getAccountKindName(AccountKind.INTERNAL)}</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col lg="3" md="6" sm="6">
                    <Form.Group controlId="formPricePlan">
                        <Form.Label>
                            Prisplan
                            <RequiredIndicator required={isFieldRequired(Status.DRAFT)} />
                        </Form.Label>
                        <Form.Control
                            as="select"
                            name="pricePlan"
                            defaultValue={booking.pricePlan}
                            required={isFieldRequired(Status.DRAFT)}
                        >
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
                        <Form.Control as="textarea" name="note" rows={2} defaultValue={booking.note} />
                    </Form.Group>
                </Col>
            </Row>
            <h6>Kontaktperson</h6>
            <hr />
            <Row>
                <Col lg="4" md="4">
                    <Form.Group controlId="formContactPersonName">
                        <Form.Label>
                            Namn
                            <RequiredIndicator required={isFieldRequired(Status.BOOKED)} />
                        </Form.Label>
                        <Form.Control
                            required={isFieldRequired(Status.BOOKED)}
                            type="text"
                            placeholder="Mats Matsson"
                            name="contactPersonName"
                            defaultValue={booking.contactPersonName}
                        />
                    </Form.Group>
                </Col>
                <Col lg="4" md="4">
                    <Form.Group controlId="formContactPersonEmail">
                        <Form.Label>
                            Email
                            <RequiredIndicator required={isFieldRequired(Status.BOOKED)} />
                        </Form.Label>
                        <Form.Control
                            required={isFieldRequired(Status.BOOKED)}
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
                                <Form.Label>
                                    Hogia ID
                                    <RequiredIndicator
                                        required={isFieldRequired(Status.BOOKED) && hoogiaIdIsRequired}
                                    />
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="1234"
                                    name="invoiceHogiaId"
                                    onChange={(e) => setInvoceAddressIsRequired(e.target.value.length === 0)}
                                    defaultValue={booking.invoiceHogiaId ?? undefined}
                                />
                            </Form.Group>
                        </Col>
                        <Col lg="4" md="4">
                            <Form.Group controlId="formInvoiceTag">
                                <Form.Label>
                                    Fakturamärkning
                                    <RequiredIndicator required={isFieldRequired(Status.BOOKED)} />
                                </Form.Label>
                                <Form.Control
                                    required={isFieldRequired(Status.BOOKED)}
                                    type="text"
                                    name="invoiceTag"
                                    defaultValue={booking.invoiceTag}
                                />
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
                                <Form.Label>
                                    Fakturaadress
                                    <RequiredIndicator
                                        required={isFieldRequired(Status.BOOKED) && invoceAddressIsRequired}
                                    />
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="invoiceAddress"
                                    rows={3}
                                    onChange={(e) => setHogiaIdIsRequired(e.target.value.length === 0)}
                                    defaultValue={booking.invoiceAddress}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <h6>Övrigt</h6>
                    <hr />
                    <Row>
                        <Col>
                            <Form.Group controlId="formPaymentStatus">
                                <Form.Label>Betalningsstatus</Form.Label>
                                <Form.Control as="select" name="paymentStatus" defaultValue={booking.paymentStatus}>
                                    <option value={PaymentStatus.NOT_PAID}>
                                        {getPaymentStatusName(PaymentStatus.NOT_PAID)}
                                    </option>
                                    <option value={PaymentStatus.PAID}>
                                        {getPaymentStatusName(PaymentStatus.PAID)}
                                    </option>
                                    <option value={PaymentStatus.INVOICED}>
                                        {getPaymentStatusName(PaymentStatus.INVOICED)}
                                    </option>
                                    <option value={PaymentStatus.PAID_WITH_INVOICE}>
                                        {getPaymentStatusName(PaymentStatus.PAID_WITH_INVOICE)}
                                    </option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
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

            <Form.Control type="hidden" name="calendarBookingId" defaultValue={booking?.calendarBookingId} />
        </Form>
    );
};

export default BookingForm;
