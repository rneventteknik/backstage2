import React, { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { UpdateAuthRequest } from '../../models/misc/UpdateAuthApiModels';
import { Role } from '../../models/enums/Role';
import { getRoleName } from '../../lib/utils';
import RequiredIndicator from '../utils/RequiredIndicator';

type Props = {
    handleSubmit: (changePasswordRequest: UpdateAuthRequest) => void;
    previousUserName?: string;
    previousRole?: Role;
    hideRoleInput: boolean;
    userId: number;
    formId: string;
};

const UserAuthForm: React.FC<Props> = ({
    handleSubmit: handleSubmitUser,
    previousUserName,
    previousRole,
    hideRoleInput,
    userId,
    formId,
}: Props) => {
    const [validated, setValidated] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.password.value !== form.confirmPassword.value) {
            form.confirmPassword.setCustomValidity('De två lösenorden är inte lika');
        }

        if (form.checkValidity() === false) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        const modifiedUserAuth: UpdateAuthRequest = {
            userId: userId,
            username: form.username.value,
            role: form.userRole?.value,
            password: form.password.value,
            existingPassword: form.existingPassword.value,
        };

        handleSubmitUser(modifiedUserAuth);
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Form.Group controlId="formUsername">
                <Form.Label>
                    Användarnamn
                    <RequiredIndicator />
                </Form.Label>
                <Form.Control required type="text" name="username" defaultValue={previousUserName} />
                <Form.Text className="text-muted">Användarnamnet måste vara unikt.</Form.Text>
            </Form.Group>
            {!hideRoleInput ? (
                <Form.Group controlId="formRole">
                    <Form.Label>
                        Behörighet
                        <RequiredIndicator />
                    </Form.Label>
                    <Form.Control
                        as="select"
                        name="userRole"
                        defaultValue={previousRole ?? Role.USER}
                        disabled={hideRoleInput}
                    >
                        <option value={Role.ADMIN}> {getRoleName(Role.ADMIN)}</option>
                        <option value={Role.USER}> {getRoleName(Role.USER)}</option>
                        <option value={Role.READONLY}> {getRoleName(Role.READONLY)}</option>
                        <option value={Role.CASH_PAYMENT_MANAGER}> {getRoleName(Role.CASH_PAYMENT_MANAGER)}</option>
                    </Form.Control>
                </Form.Group>
            ) : null}
            <Form.Group controlId="formPassword">
                <Form.Label>Nytt Lösenord</Form.Label>
                <Form.Control type="password" name="password" />
                <Form.Text className="text-muted">
                    Max 72 tecken. Lämnas fältet tomt kommer inte lösenordet att bytas.
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
                <Form.Label>Bekräfta det nya lösenordet</Form.Label>
                <Form.Control type="password" name="confirmPassword" />
            </Form.Group>
            <hr />
            <Form.Group controlId="formPassword">
                <Form.Label>
                    Ditt nuvarande lösenord
                    <RequiredIndicator />
                </Form.Label>
                <Form.Control type="password" name="existingPassword" />
                <Form.Text className="text-muted">
                    Bekräfta din identitet genom att ange ditt nuvarande lösenord.
                </Form.Text>
            </Form.Group>
        </Form>
    );
};

export default UserAuthForm;
