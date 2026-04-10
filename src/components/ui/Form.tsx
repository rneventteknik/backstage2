import React from 'react';

// Shared input/select/textarea classes
const controlBase =
    'block w-full bg-bs-4 border border-bs-4 text-body placeholder-muted px-3 py-1.5 text-sm focus:outline-none focus:border-bs-7 disabled:opacity-60 disabled:bg-bs-1 transition-colors';

// FormControlProps — allows extending with native input props
export type FormControlProps = React.InputHTMLAttributes<HTMLInputElement>;

// Form.Group
const FormGroup: React.FC<{ controlId?: string; className?: string; children: React.ReactNode }> = ({
    controlId,
    className = '',
    children,
}) => (
    <div id={controlId ? `fg-${controlId}` : undefined} className={`mb-4 ${className}`}>
        {children}
    </div>
);

// Form.Label
const FormLabel: React.FC<{ htmlFor?: string; className?: string; children: React.ReactNode }> = ({
    htmlFor,
    className = '',
    children,
}) => (
    <label htmlFor={htmlFor} className={`block mb-1 text-sm text-body ${className}`}>
        {children}
    </label>
);

// Form.Control — renders input, textarea, or select depending on `as` prop
interface FormControlElementProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    as?: 'input' | 'textarea' | 'select';
    rows?: number;
    isInvalid?: boolean;
    isValid?: boolean;
    size?: 'sm' | 'lg';
    htmlSize?: number;
    children?: React.ReactNode; // for <select> options
}

const FormControl = React.forwardRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    FormControlElementProps
>(({ as: Tag = 'input', rows, isInvalid, isValid, size: _size, className = '', children, ...props }, ref) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    const validClass = isInvalid ? 'border-danger' : isValid ? 'border-success' : '';
    const combined = `${controlBase} ${validClass} ${className}`;

    if (Tag === 'textarea') {
        const { type: _t, ...rest } = props as React.TextareaHTMLAttributes<HTMLTextAreaElement> & { type?: string }; // eslint-disable-line @typescript-eslint/no-unused-vars
        return (
            <textarea
                ref={ref as React.Ref<HTMLTextAreaElement>}
                rows={rows ?? 3}
                className={combined}
                {...rest}
            />
        );
    }

    if (Tag === 'select') {
        const { type: _t, ...rest } = props as React.SelectHTMLAttributes<HTMLSelectElement> & { type?: string }; // eslint-disable-line @typescript-eslint/no-unused-vars
        return (
            <select
                ref={ref as React.Ref<HTMLSelectElement>}
                className={combined}
                {...rest}
            >
                {children}
            </select>
        );
    }

    return (
        <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={combined}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
    );
});
FormControl.displayName = 'FormControl';

// Form.Select (native <select>)
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    isInvalid?: boolean;
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ isInvalid, className = '', children, ...props }, ref) => (
        <select
            ref={ref}
            className={`${controlBase} ${isInvalid ? 'border-danger' : ''} ${className}`}
            {...props}
        >
            {children}
        </select>
    ),
);
FormSelect.displayName = 'FormSelect';

// Form.Check
interface FormCheckProps {
    type?: 'checkbox' | 'radio';
    label?: React.ReactNode;
    id?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    disabled?: boolean;
    className?: string;
    name?: string;
    value?: string | number;
    inline?: boolean;
}

const FormCheck: React.FC<FormCheckProps> = ({
    type = 'checkbox',
    label,
    id,
    inline,
    className = '',
    ...props
}) => (
    <div className={`flex items-center gap-2 ${inline ? 'inline-flex mr-4' : ''} ${className}`}>
        <input
            id={id}
            type={type}
            className="accent-primary cursor-pointer"
            {...props}
        />
        {label && (
            <label htmlFor={id} className="text-sm text-body cursor-pointer select-none">
                {label}
            </label>
        )}
    </div>
);

// Form.Text
const FormText: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
    <small className={`block mt-1 text-xs text-muted ${className}`}>{children}</small>
);

// Form (just a wrapper — keeps native form semantics)
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    validated?: boolean;
}

const FormRoot: React.FC<FormProps> = ({ validated: _v, className = '', children, ...props }) => ( // eslint-disable-line @typescript-eslint/no-unused-vars
    <form className={className} {...props}>
        {children}
    </form>
);

export const Form = Object.assign(FormRoot, {
    Group: FormGroup,
    Label: FormLabel,
    Control: FormControl,
    Select: FormSelect,
    Check: FormCheck,
    Text: FormText,
});

// Legacy named exports used in some files
export { FormControl, FormGroup };
