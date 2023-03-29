import React, { useContext } from 'react';
import { Language } from '../models/enums/Language';
import { defaultTextResources } from './defaultTextResources';

export const TextResourcesContext = React.createContext<{
    language: Language;
    textResources: Record<Language, Record<string, string>>;
}>({ language: Language.SV, textResources: { sv: {}, en: {} } });

export const getTextResource = (
    key: string,
    language: Language,
    textResources: Record<Language, Record<string, string>>,
): string => textResources[language][key] ?? defaultTextResources[language][key] ?? `[${key}]`;

export const useTextResources = (): { t: (key: string) => string; locale: 'sv-SE' | 'en-SE' } => {
    const { language, textResources } = useContext(TextResourcesContext);
    return {
        t: (key: string) => getTextResource(key, language, textResources),
        locale: language === Language.EN ? 'en-SE' : 'sv-SE',
    };
};
