import React, { ReactNode, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

const doubleClickToEditHelpText = 'Klicka för att redigera';

type ClickToEditProps = {
    children?: ReactNode;
    value?: string;
    size?: 'sm' | 'lg' | undefined;
    onUpdate: (x: string) => void;
    readonly?: boolean;
    inputType?: string;
    className?: string;
    min?: string;
    max?: string;
};

export const ClickToEdit: React.FC<ClickToEditProps> = ({
    value,
    onUpdate,
    size,
    children,
    readonly,
    inputType,
    className,
    min,
    max,
}: ClickToEditProps) => {
    const [trackedValue, setTrackedValue] = useState(value ?? '');
    const [isEditing, setIsEditing] = useState(false);

    const editingComplete = () => {
        setIsEditing(false);
        if (trackedValue !== value) {
            onUpdate(trackedValue);
        }
    };

    const startEditing = () => {
        setTrackedValue(value ?? '');
        setIsEditing(true);
    };

    if (readonly) {
        return <span>{children}</span>;
    }

    if (!isEditing) {
        return (
            <span
                role="button"
                className={className}
                title={doubleClickToEditHelpText}
                tabIndex={0}
                onDoubleClick={() => setIsEditing(true)}
                onFocus={() => startEditing()}
            >
                {children}
            </span>
        );
    }

    return (
        <Form.Control
            type={inputType ?? 'text'}
            placeholder={value}
            size={size}
            className={className}
            defaultValue={value}
            min={min}
            max={max}
            onChange={(e) => setTrackedValue(e.target.value)}
            onBlur={editingComplete}
            onKeyDown={(e: React.KeyboardEvent) => (e.key === 'Enter' ? editingComplete() : null)}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            autoFocus
        />
    );
};

type ClickToEditDropdownProps<T> = {
    children?: ReactNode;
    options: T[];
    optionLabelFn: (option: T) => string;
    optionKeyFn: (option: T) => string;
    value: T;
    size?: 'sm' | 'lg' | undefined;
    onChange?: (x: T | undefined) => void;
    onClose?: (x: T | undefined) => void;
    readonly?: boolean;
};

export const ClickToEditDropdown = <T,>({
    value,
    options,
    optionLabelFn,
    optionKeyFn,
    onChange,
    onClose,
    size,
    children,
    readonly,
}: ClickToEditDropdownProps<T>): React.ReactElement => {
    const [selectedKey, setSelectedKey] = useState(optionKeyFn(value));
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setSelectedKey(optionKeyFn(value));
    }, [value, optionKeyFn]);

    const getSelectedValue = (key: string) => options.find((x) => optionKeyFn(x) == key);

    const updateValue = (key: string) => {
        setSelectedKey(key);
        onChange ? onChange(getSelectedValue(key)) : null;
    };

    const editingComplete = () => {
        setIsEditing(false);
        if (selectedKey !== optionKeyFn(value)) {
            onClose ? onClose(getSelectedValue(selectedKey)) : null;
        }
    };

    if (readonly) {
        return <span>{children}</span>;
    }

    if (!isEditing) {
        return (
            <span
                role="button"
                title={doubleClickToEditHelpText}
                tabIndex={0}
                onDoubleClick={() => setIsEditing(true)}
                onFocus={() => setIsEditing(true)}
            >
                {children}
            </span>
        );
    }

    return (
        <Form.Control
            as="select"
            size={size}
            defaultValue={optionKeyFn(value)}
            onChange={(e) => updateValue(e.target.value)}
            onBlur={editingComplete}
            onKeyDown={(e: { key: string }) => (e.key === 'Enter' ? editingComplete() : null)}
            autoFocus
        >
            {options.map((x) => (
                <option key={optionKeyFn(x)} value={optionKeyFn(x)}>
                    {optionLabelFn(x)}
                </option>
            ))}
        </Form.Control>
    );
};
