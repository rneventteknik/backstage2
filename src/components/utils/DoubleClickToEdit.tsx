import React, { ReactNode, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { convertToDateOrUndefined, formatDatetime } from '../../lib/utils';

const doubleClickToEditHelpText = 'Dubbelklicka för att redigera';

type DoubleClickToEditProps = {
    children?: ReactNode;
    value?: string;
    size?: 'sm' | 'lg' | undefined;
    onUpdate: (x: string) => void;
    readonly?: boolean;
};

export const DoubleClickToEdit: React.FC<DoubleClickToEditProps> = ({
    value,
    onUpdate,
    size,
    children,
    readonly,
}: DoubleClickToEditProps) => {
    const [trackedValue, setTrackedValue] = useState(value ?? '');
    const [isEditing, setIsEditing] = useState(false);

    const editingComplete = () => {
        setIsEditing(false);
        if (trackedValue !== value) {
            onUpdate(trackedValue);
        }
    };

    if (readonly) {
        return <span>{children}</span>;
    }

    if (!isEditing) {
        return (
            <span role="button" title={doubleClickToEditHelpText} onDoubleClick={() => setIsEditing(true)}>
                {children}
            </span>
        );
    }

    return (
        <Form.Control
            type="text"
            placeholder={value}
            size={size}
            defaultValue={value}
            onChange={(e) => setTrackedValue(e.target.value)}
            onBlur={editingComplete}
            onKeyDown={(e: React.KeyboardEvent) => (e.key === 'Enter' ? editingComplete() : null)}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            autoFocus
        />
    );
};

type DoubleClickToEditDateProps = {
    value?: Date;
    onUpdate: (x: Date | undefined) => void;
    size?: 'sm' | 'lg' | undefined;
    readonly?: boolean;
};

export const DoubleClickToEditDate: React.FC<DoubleClickToEditDateProps> = ({
    value,
    onUpdate,
    size,
    readonly,
}: DoubleClickToEditDateProps) => {
    return (
        <DoubleClickToEdit
            value={value ? formatDatetime(value) : ''}
            onUpdate={(newValue) => onUpdate(convertToDateOrUndefined(newValue))}
            size={size}
            readonly={readonly}
        >
            <div className="mb-3">
                {value ? (
                    formatDatetime(value)
                ) : (
                    <span className="text-muted" title="Dubbelklicka för att konfigurera">
                        N/A
                    </span>
                )}
            </div>
        </DoubleClickToEdit>
    );
};

type DoubleClickToEditDropdownProps<T> = {
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

export const DoubleClickToEditDropdown = <T,>({
    value,
    options,
    optionLabelFn,
    optionKeyFn,
    onChange,
    onClose,
    size,
    children,
    readonly,
}: DoubleClickToEditDropdownProps<T>): React.ReactElement => {
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
            <span role="button" title={doubleClickToEditHelpText} onDoubleClick={() => setIsEditing(true)}>
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
