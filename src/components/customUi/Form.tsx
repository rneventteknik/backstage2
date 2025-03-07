import React, { ChangeEvent } from 'react';

type Props = {
    className?: string;
    children: React.ReactNode;
    action: string;
    method: 'get' | 'post' | 'put' | 'delete';
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const Form: React.FC<Props> = ({ children, className, action, method, onSubmit }: Props) => {
    return (
        <form className={className} action={action} method={method} onSubmit={onSubmit}>
            {children}
        </form>
    );
};

type FormControlProps = {
    className?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    name?: string;
    type?: 'text' | 'password' | 'date'; // TODO
    size?: 'sm' | 'md' | 'lg'; // TODO
    ref?: React.RefObject<HTMLInputElement>
    autoComplete?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const FormControl: React.FC<FormControlProps> = ({ className, placeholder, value, defaultValue, name, type, ref, autoComplete, onChange }: FormControlProps) => {
    return (
        <input
            className={'border border-gray-200 p-2 ' + className}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            name={name}
            type={type}
            ref={ref}
            autoComplete={autoComplete} 
            onChange={onChange}
        />
    );
};

type FormControlSelectProps = {
    className?: string;
    children: React.ReactNode;
    value?: string;
    defaultValue?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg'; // TODO
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export const FormControlSelect: React.FC<FormControlSelectProps> = ({ children, className, value, defaultValue, name, onChange }: FormControlSelectProps) => {
    return (
        <select
            className={'border border-gray-200 p-2 ' + className}
            value={value}
            defaultValue={defaultValue}
            name={name}
            onChange={onChange}
        >
            {children}
        </select>
    );
};

type FormGroupProps = {
    className?: string;
    children: React.ReactNode;
    controlId?: string; // TODO
};

export const FormGroup: React.FC<FormGroupProps> = ({ children, className }: FormGroupProps) => {
    return (
        <div className={'border border-gray-200 ' + className}>
            {children}
        </div>
    );
};

type FormLabelProps = {
    className?: string;
    children?: React.ReactNode;
    htmlFor?: string;
};

export const FormLabel: React.FC<FormLabelProps> = ({ children, className, htmlFor }: FormLabelProps) => {
    return (
        <label htmlFor={htmlFor} className={'block p-2 ' + className}>
            {children}
        </label>
    );
};