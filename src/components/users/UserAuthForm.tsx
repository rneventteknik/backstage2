import React, { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { UpdateAuthRequest } from '../../models/misc/UpdateAuthApiModels';
import { Role } from '../../models/enums/Role';
import { getRoleName } from '../../lib/utils';

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
            role: form.role?.value,
            password: form.password.value,
        };

        handleSubmitUser(modifiedUserAuth);
    };

    return (
        <Form id={formId} onSubmit={handleSubmit} noValidate validated={validated}>
            <Form.Group controlId="formUsername">
                <Form.Label>Användarnamn</Form.Label>
                <Form.Control required type="text" name="username" defaultValue={previousUserName} />
                <Form.Text className="text-muted">Användarnamnet måste vara unikt.</Form.Text>
            </Form.Group>
            {!hideRoleInput ? (
                <Form.Group controlId="formRole">
                    <Form.Label>Behörighet</Form.Label>
                    <Form.Control
                        as="select"
                        name="role"
                        defaultValue={previousRole ?? Role.USER}
                        disabled={hideRoleInput}
                    >
                        <option value={Role.ADMIN}> {getRoleName(Role.ADMIN)}</option>
                        <option value={Role.USER}> {getRoleName(Role.USER)}</option>
                        <option value={Role.READONLY}> {getRoleName(Role.READONLY)}</option>
                    </Form.Control>
                </Form.Group>
            ) : null}
            <Form.Group controlId="formPassword">
                <Form.Label>Lösenord</Form.Label>
                <Form.Control type="password" name="password" />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
                <Form.Label>Bekräfta lösenordet</Form.Label>
                <Form.Control type="password" name="confirmPassword" />
            </Form.Group>
        </Form>
    );
};

export default UserAuthForm;
