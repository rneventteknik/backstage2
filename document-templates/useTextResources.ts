import React, { useContext } from 'react';
import { documentTextResources } from './documentTextResources';

export enum Language {
    SV = 'SV',
    EN = 'EN',
}

export const TextResourcesLanguageContext = React.createContext(Language.SV);

export const getTextResource = (key: string, language: Language): string =>
    documentTextResources[language][key] ?? `[${key}]`;

export const useTextResources = (): { t: (key: string) => string } => {
    const language = useContext(TextResourcesLanguageContext);
    return { t: (key: string) => getTextResource(key, language) };
};
