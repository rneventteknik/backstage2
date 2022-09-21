import React, { useContext } from 'react';
import { Language } from '../models/enums/Language';
import { documentTextResources } from './documentTextResources';

export const TextResourcesLanguageContext = React.createContext(Language.SV);

export const getTextResource = (key: string, language: Language): string =>
    documentTextResources[language][key] ?? `[${key}]`;

export const useTextResources = (): { t: (key: string) => string; locale: 'sv-SE' | 'en-SE' } => {
    const language = useContext(TextResourcesLanguageContext);
    return {
        t: (key: string) => getTextResource(key, language),
        locale: language === Language.EN ? 'en-SE' : 'sv-SE',
    };
};
