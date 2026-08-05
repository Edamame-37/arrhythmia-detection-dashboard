import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface ConnectedPatient {
  id: string;
  name: string;
  profile_photo?: string;
  connectedAt: string;
}

export interface ConnectedDoctor {
  id?: string;
  name: string;
  hospital: string;
  photo?: string;
}

interface ConnectionContextType {
  connectedPatient: ConnectedPatient | null;
  connectedDoctor: ConnectedDoctor | null;
  setConnectedPatient: (patient: ConnectedPatient | null) => void;
  setConnectedDoctor: (doctor: ConnectedDoctor | null) => void;
  disconnectAll: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connectedPatient, setConnectedPatientState] = useState<ConnectedPatient | null>(() => {
    const saved = localStorage.getItem('connectedPatient');
    return saved ? JSON.parse(saved) : null;
  });

  const [connectedDoctor, setConnectedDoctorState] = useState<ConnectedDoctor | null>(() => {
    const saved = localStorage.getItem('connectedDoctor');
    return saved ? JSON.parse(saved) : null;
  });

  // Effect to persist patient connection
  useEffect(() => {
    if (connectedPatient) {
      localStorage.setItem('connectedPatient', JSON.stringify(connectedPatient));
    } else {
      localStorage.removeItem('connectedPatient');
      localStorage.removeItem('connectedDoctor');
      setConnectedDoctorState(null);
    }
  }, [connectedPatient]);

  const setConnectedPatient = (patient: ConnectedPatient | null) => {
    setConnectedPatientState(patient);
  };

  const setConnectedDoctor = (doctor: ConnectedDoctor | null) => {
    setConnectedDoctorState(doctor);
    if (doctor) {
      localStorage.setItem('connectedDoctor', JSON.stringify(doctor));
    } else {
      localStorage.removeItem('connectedDoctor');
    }
  };

  const disconnectAll = () => {
    setConnectedPatientState(null);
    setConnectedDoctorState(null);
    localStorage.removeItem('connectedPatient');
    localStorage.removeItem('connectedDoctor');
  };

  return (
    <ConnectionContext.Provider value={{ connectedPatient, connectedDoctor, setConnectedPatient, setConnectedDoctor, disconnectAll }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = (): ConnectionContextType => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
