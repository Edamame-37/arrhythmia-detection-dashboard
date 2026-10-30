import { readStored } from '../../core/utils/storage';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PreferencesContextType {
  isLargeText: boolean;
  setIsLargeText: (val: boolean) => void;
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
  language: string;
  setLanguage: (val: string) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

const getInitialPreferences = () =>
  readStored(
    localStorage,
    'app_preferences',
    { isLargeText: false, isHighContrast: false, language: 'id' },
    (
      value,
    ): value is {
      isLargeText: boolean;
      isHighContrast: boolean;
      language: string;
    } =>
      typeof value === 'object' &&
      value !== null &&
      typeof (value as any).isLargeText === 'boolean' &&
      typeof (value as any).isHighContrast === 'boolean' &&
      ['id', 'en', 'zh', 'he', 'ar'].includes((value as any).language),
  );

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initialPrefs = getInitialPreferences();
  const [isLargeText, setIsLargeText] = useState(
    initialPrefs.isLargeText || false,
  );
  const [isHighContrast, setIsHighContrast] = useState(
    initialPrefs.isHighContrast || false,
  );
  const [language, setLanguage] = useState(initialPrefs.language || 'id');

  // Save to localStorage and apply side effects whenever state changes
  useEffect(() => {
    localStorage.setItem(
      'app_preferences',
      JSON.stringify({
        isLargeText,
        isHighContrast,
        language,
      }),
    );

    // Ensure dark mode is off since it's removed
    document.documentElement.classList.remove('dark');

    if (isLargeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isLargeText, isHighContrast, language]);

  return (
    <PreferencesContext.Provider
      value={{
        isLargeText,
        setIsLargeText,
        isHighContrast,
        setIsHighContrast,
        language,
        setLanguage,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
