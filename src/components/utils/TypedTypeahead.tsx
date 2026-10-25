import { ReactElement, Ref } from 'react';
import { AsyncTypeahead, Typeahead, TypeaheadRef } from 'react-bootstrap-typeahead';
import type {
    RenderMenuProps,
    TypeaheadComponentProps,
    TypeaheadMenuProps,
    UseAsyncProps,
} from 'react-bootstrap-typeahead';

// react-bootstrap-typeahead types every option as `string | Record<string, any>`. These wrappers take the option type
// as a type parameter instead, so that callers get typed options and the casts to the library's types are kept here.

export type TypeaheadMenuState = Parameters<NonNullable<TypeaheadComponentProps['renderMenu']>>[2];
type FilterByState = Parameters<Extract<TypeaheadComponentProps['filterBy'], (...args: never[]) => boolean>>[1];

type TypedOptionProps<T extends object> = {
    options: T[];
    selected?: T[];
    onChange?: (selected: T[]) => void;
    labelKey?: (keyof T & string) | ((option: T) => string);
    filterBy?: (keyof T & string)[] | ((option: T, state: FilterByState) => boolean);
    renderMenu?: (results: T[], menuProps: RenderMenuProps, state: TypeaheadMenuState) => ReactElement;
    renderMenuItemChildren?: (option: T, menuProps: TypeaheadMenuProps, index: number) => ReactElement;
    ref?: Ref<TypeaheadRef>;
};

type OptionPropNames = keyof TypedOptionProps<object>;

export type TypedTypeaheadProps<T extends object> = Omit<TypeaheadComponentProps, OptionPropNames> &
    TypedOptionProps<T>;

export type TypedAsyncTypeaheadProps<T extends object> = Omit<UseAsyncProps, OptionPropNames> & TypedOptionProps<T>;

export const TypedTypeahead = <T extends object>({ ref, ...props }: TypedTypeaheadProps<T>): ReactElement => (
    <Typeahead ref={ref} {...(props as unknown as TypeaheadComponentProps)} />
);

export const TypedAsyncTypeahead = <T extends object>({ ref, ...props }: TypedAsyncTypeaheadProps<T>): ReactElement => (
    <AsyncTypeahead ref={ref} {...(props as unknown as UseAsyncProps)} />
);
