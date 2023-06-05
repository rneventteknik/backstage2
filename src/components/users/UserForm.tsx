import React, { FormEvent, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { User } from '../../models/interfaces';
import { IUserObjectionModel } from '../../models/objection-models/UserObjectionModel';
import { MemberStatus } from '../../models/enums/MemberStatus';
import { getMemberStatusName } from '../../lib/utils';
import RequiredIndicator from '../utils/RequiredIndicator';

type Props = {
    handleSubmitUser: (user: IUserObjectionModel) => void;
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

        const modifiedUser: IUserObjectionModel = {
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
        };

        handleSubmitUser(modifiedUser);
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Row>
                <Col lg="6">
                    <Form.Group controlId="formName">
                        <Form.Label>
                            Namn
                            <RequiredIndicator />
                        </Form.Label>
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
                        <Form.Label>
                            Tagg
                            <RequiredIndicator />
                        </Form.Label>
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
                        <Form.Label>
                            Medlemsstatus
                            <RequiredIndicator />
                        </Form.Label>
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

            <h2 className="h5 mt-4">Kontaktuppgifter</h2>
            <hr />
            <Row>
                <Col lg="3">
                    <Form.Group controlId="formEmailAddress">
                        <Form.Label>
                            Emailadress
                            <RequiredIndicator />
                        </Form.Label>
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

            <h2 className="h5 mt-4">Bankuppgifter</h2>
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
                <Col lg="12">
                    <Form.Group controlId="formHomeAddress">
                        <Form.Label>Adress</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="homeAddress"
                            defaultValue={user?.homeAddress}
                            placeholder={'Hemvägen 2\n123 45 Ort'}
                            rows={2}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

export default UserForm;
