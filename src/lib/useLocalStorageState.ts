import { useState, useEffect } from 'react';

const getLocalStorageValue = <T>(key: string, defaultValue: T) => {
    // Verify that we are running in the client and not serverside.
    if (typeof window === 'undefined') {
        throw new Error(
            'Cannot read from local storage serverside. The useLocalStorageState hook can only be used clientside.',
        );
    }

    const value = localStorage.getItem(key);

    if (value === 'undefined') {
        return undefined;
    }

    if (value) {
        return JSON.parse(value);
    }

    return defaultValue;
};

// Please note: This hook cannot be executed serverside as it uses local storage.
//
export const useLocalStorageState = <T>(
    key: string,
    defaultValue?: T,
): [value: T, setValue: (value: T | ((oldValue: T) => T)) => void] => {
    const [value, setValue] = useState<T>(() => {
        return getLocalStorageValue(key, defaultValue);
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};

// JSON do not handle dates well, so we need a seperate function to sort that out
// Please note: This hook cannot be executed serverside as it uses local storage.
//
export const useLocalStorageStateForDate = (
    key: string,
    defaultValue?: string,
): [
    value: Date | undefined,
    setValue: (value: Date | undefined | ((oldValue: Date | undefined) => Date | undefined)) => void,
] => {
    const [value, setValue] = useState<Date | undefined>(() => {
        const value = getLocalStorageValue<string | undefined>(key, defaultValue);

        if (!value) {
            return undefined;
        }

        return new Date(value);
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};
