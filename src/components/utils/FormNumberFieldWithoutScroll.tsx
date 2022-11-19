import React, { InputHTMLAttributes } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

export const FormNumberFieldWithoutScroll = React.forwardRef(
    (props: FormControlProps & InputHTMLAttributes<HTMLInputElement>, ref) => (
        <Form.Control
            {...props}
            ref={ref}
            onWheel={(event: WheelEvent) => (event.currentTarget as HTMLInputElement)?.blur()}
        />
    ),
);

FormNumberFieldWithoutScroll.displayName = 'FormNumberFieldWithoutScroll';
