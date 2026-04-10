import React from 'react';
import { Form } from '../ui/Form';

// Omit native 'size' (number) to avoid conflict with Form.Control's 'size' ('sm'|'lg')
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    size?: 'sm' | 'lg';
    isInvalid?: boolean;
    isValid?: boolean;
    readOnly?: boolean;
};

export const FormNumberFieldWithoutScroll = React.forwardRef<HTMLInputElement, Props>(
    (props, ref) => (
        <Form.Control
            {...props}
            ref={ref}
            onWheel={(event: React.WheelEvent) => (event.currentTarget as HTMLInputElement)?.blur()}
        />
    ),
);

FormNumberFieldWithoutScroll.displayName = 'FormNumberFieldWithoutScroll';
