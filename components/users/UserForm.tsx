import React, { FormEvent, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { User } from '../../interfaces';
import { IUserApiModel } from '../../interfaces/api-models/UserApiModel';
import { MemberStatus } from '../../interfaces/enums/MemberStatus';
import { getMemberStatusName } from '../../lib/utils';

type Props = {
    handleSubmitUser: (user: IUserApiModel) => void;
    user?: User;
    formId: string;
};

const UserForm: React.FC<Props> = ({ handleSubmitUser, user, formId }: Props) => {
    const [validated, setValidated] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const modifiedUser: IUserApiModel = {
            id: user?.id,
            created: user?.created?.toString(),
            updated: user?.updated?.toString(),

            name: form.fullname.value,
            nameTag: form.nameTag.value,
            memberStatus: form.memberStatus.value,
            phoneNumber: form.phoneNumber.value,
            emailAddress: form.emailAddress.value,
            slackId: form.slackId.value,
            personalIdentityNumber: form.personalIdentityNumber.value,
            bankAccount: form.bankAccount.value,
            clearingNumber: form.clearingNumber.value,
            bankName: form.bankName.value,
            homeAddress: form.homeAddress.value,
            zipCode: form.zipCode.value,
        };

        handleSubmitUser(modifiedUser);
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formName">
                        <Form.Label>Namn</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Anders Andersson"
                            name="fullname"
                            defaultValue={user?.name}
                        />
                        <Form.Text className="text-muted">Användarens fullständiga namn.</Form.Text>
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formNameTag">
                        <Form.Label>Tagg</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="XX"
                            name="nameTag"
                            defaultValue={user?.nameTag}
                        />
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formMemberStatus">
                        <Form.Label>Medlemsstatus</Form.Label>
                        <Form.Control
                            as="select"
                            name="memberStatus"
                            defaultValue={user?.memberStatus ?? MemberStatus.AKTIV}
                        >
                            <option value={MemberStatus.CHEF}>{getMemberStatusName(MemberStatus.CHEF)}</option>
                            <option value={MemberStatus.AKTIV}>{getMemberStatusName(MemberStatus.AKTIV)}</option>
                            <option value={MemberStatus.ASP}>{getMemberStatusName(MemberStatus.ASP)}</option>
                            <option value={MemberStatus.RESURS}>{getMemberStatusName(MemberStatus.RESURS)}</option>
                            <option value={MemberStatus.GLÖMD}>{getMemberStatusName(MemberStatus.GLÖMD)}</option>
                        </Form.Control>
                        <Form.Text className="text-muted">
                            Notera att medlemsstatusen inte påverkar behörigheterna i Backstage2.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <h6>Kontaktuppgifter</h6>
            <hr />
            <Row>
                <Col lg="3">
                    <Form.Group controlId="formEmailAddress">
                        <Form.Label>Emailadress</Form.Label>
                        <Form.Control
                            required
                            type="email"
                            placeholder="user@example.com"
                            name="emailAddress"
                            defaultValue={user?.emailAddress}
                        />
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formPhoneNumber">
                        <Form.Label>Telefonnummer</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="XXX XXX XX XX"
                            name="phoneNumber"
                            defaultValue={user?.phoneNumber}
                        />
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formSlackId">
                        <Form.Label>Slack ID</Form.Label>
                        <Form.Control type="text" placeholder="Slack ID" name="slackId" defaultValue={user?.slackId} />
                    </Form.Group>
                </Col>
            </Row>

            <h6>Bankuppgifter</h6>
            <hr />
            <Row>
                <Col lg="3">
                    <Form.Group controlId="formPersonalIdentityNumber">
                        <Form.Label>Personnummer</Form.Label>
                        <Form.Control
                            type="text"
                            name="personalIdentityNumber"
                            defaultValue={user?.personalIdentityNumber}
                        />
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formBankAccount">
                        <Form.Label>Bankkonto</Form.Label>
                        <Form.Control type="text" name="bankAccount" defaultValue={user?.bankAccount} />
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formClearingNumber">
                        <Form.Label>Clearingnummer</Form.Label>
                        <Form.Control type="text" name="clearingNumber" defaultValue={user?.clearingNumber} />
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formBankName">
                        <Form.Label>Banknamn</Form.Label>
                        <Form.Control type="text" name="bankName" defaultValue={user?.bankName} />
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formHomeAddress">
                        <Form.Label>Hemadress</Form.Label>
                        <Form.Control type="text" name="homeAddress" defaultValue={user?.homeAddress} />
                    </Form.Group>
                </Col>
                <Col lg="3">
                    <Form.Group controlId="formZipCode">
                        <Form.Label>Postnummer</Form.Label>
                        <Form.Control type="text" name="zipCode" defaultValue={user?.zipCode} />
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

export default UserForm;
