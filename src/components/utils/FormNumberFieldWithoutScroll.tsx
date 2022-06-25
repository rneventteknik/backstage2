import React, { InputHTMLAttributes } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

export const FormNumberFieldWithoutScroll: React.FC<FormControlProps & InputHTMLAttributes<HTMLInputElement>> = (
    props: FormControlProps & InputHTMLAttributes<HTMLInputElement>,
) => <Form.Control {...props} onWheel={(event: WheelEvent) => (event.currentTarget as HTMLInputElement)?.blur()} />;
