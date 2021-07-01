import React, { FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { UpdateAuthRequest } from '../../interfaces/auth/UpdateAuthApiModels';

type Props = {
    handleSubmit: (changePasswordRequest: UpdateAuthRequest) => void;
    previousUserName?: string;
    userId: number;
    formId: string;
};

const UserAuthForm: React.FC<Props> = ({ handleSubmit: handleSubmitUser, previousUserName, userId, formId }: Props) => {
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
            <Form.Group controlId="formPassword">
                <Form.Label>Lösenord</Form.Label>
                <Form.Control required type="password" name="password" />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
                <Form.Label>Bekräfta lösenordet</Form.Label>
                <Form.Control required type="password" name="confirmPassword" />
            </Form.Group>
        </Form>
    );
};

export default UserAuthForm;
