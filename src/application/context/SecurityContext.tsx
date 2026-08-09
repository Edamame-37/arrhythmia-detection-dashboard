import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SecurityContextType {
  isDevToolsBlocked: boolean;
  toggleDevToolsBlocker: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDevToolsBlocked, setIsDevToolsBlocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('SECURITY_DEVTOOLS_BLOCKED');
    // Default to true (blocked) if not set
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('SECURITY_DEVTOOLS_BLOCKED', JSON.stringify(isDevToolsBlocked));
  }, [isDevToolsBlocked]);

  const toggleDevToolsBlocker = () => {
    setIsDevToolsBlocked((prev) => !prev);
  };

  return (
    <SecurityContext.Provider value={{ isDevToolsBlocked, toggleDevToolsBlocker }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
