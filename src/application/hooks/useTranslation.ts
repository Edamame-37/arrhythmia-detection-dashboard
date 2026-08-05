import { usePreferences } from '../context/PreferencesContext';
import id from '../locales/id.json';
import en from '../locales/en.json';
import zh from '../locales/zh.json';
import he from '../locales/he.json';
import ar from '../locales/ar.json';

type Translations = Record<string, any>;
const dictionaries: Record<string, Translations> = { 
    id,
    en,
    zh,
    he,
    ar
};

export const useTranslation = () => {
    const { language } = usePreferences();

    const t = (key: string): string => {
        const dict = dictionaries[language] || dictionaries['id'];
        const keys = key.split('.');
        
        let value: any = dict;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }
        
        return typeof value === 'string' ? value : key;
    };

    const tArray = (key: string): string[] => {
        const dict = dictionaries[language] || dictionaries['id'];
        const keys = key.split('.');
        
        let value: any = dict;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return []; 
            }
        }
        
        return Array.isArray(value) ? value : [];
    };

    return { t, tArray };
};
