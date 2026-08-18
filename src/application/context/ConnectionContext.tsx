import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_URL } from '../../config/env';
import { fetchWithAuth } from '../../config/api';

export interface ConnectedPatient {
  id: string;
  name: string;
  profile_photo?: string;
  connectedAt: string;
  raw_id?: string;
}

export interface ConnectedDoctor {
  id?: string;
  name: string;
  hospital: string;
  photo?: string;
}

interface ConnectionContextType {
  connectedPatients: ConnectedPatient[];
  connectedDoctor: ConnectedDoctor | null;
  addConnectedPatient: (patient: ConnectedPatient) => void;
  removeConnectedPatient: (patientId: string) => void;
  clearConnectedPatients: () => void;
  setConnectedDoctor: (doctor: ConnectedDoctor | null) => void;
  disconnectAll: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connectedPatients, setConnectedPatientsState] = useState<ConnectedPatient[]>(() => {
    const saved = localStorage.getItem('connectedPatients');
    return saved ? JSON.parse(saved) : [];
  });

  const [connectedDoctor, setConnectedDoctorState] = useState<ConnectedDoctor | null>(() => {
    const saved = localStorage.getItem('connectedDoctor');
    return saved ? JSON.parse(saved) : null;
  });

  // Polling backend untuk sinkronisasi role DOCTOR dan PATIENT
  useEffect(() => {
    let isMounted = true;
    
    const syncStatus = async () => {
      const role = localStorage.getItem('user_role');
      const userId = localStorage.getItem('user_id');
      
      if (!role || !userId) return;

      try {
        if (role === 'dokter') {
          const res = await fetchWithAuth(`/api/doctors/${userId}/patients`);
          if (res.ok) {
            const data = await res.json();
            const mapped = data.map((p: any) => {
              const numStr = p.id.replace(/[^0-9]/g, '');
              const displayId = `PAT-${numStr.padStart(4, '0')}-XYZ`;
              return {
                id: displayId,
                raw_id: p.id,
                name: p.name,
                profile_photo: p.profile_photo || undefined,
                connectedAt: new Date().toISOString()
              };
            });
            if (isMounted) setConnectedPatientsState(mapped);
          }
        } else if (role === 'pasien') {
          const res = await fetchWithAuth(`/api/patients/${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.doctor) {
              if (isMounted) setConnectedDoctorState({
                id: data.doctor.id,
                name: `Dr. ${data.doctor.first_name} ${data.doctor.last_name}`,
                hospital: "",
                photo: data.doctor.profile_photo || undefined
              });
            } else {
              if (isMounted) setConnectedDoctorState(null);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to sync connection status", err);
      }
    };

    // Initial sync
    syncStatus();
    
    // Polling setiap 5 detik
    const interval = setInterval(syncStatus, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const addConnectedPatient = async (patient: ConnectedPatient) => {
    const dbPatientId = patient.raw_id || patient.id;
    const doctorId = localStorage.getItem('user_id');
    
    try {
      if (doctorId) {
        await fetchWithAuth(`/api/patients/${dbPatientId}/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctor_id: doctorId })
        });
      }
      setConnectedPatientsState(prev => {
        if (prev.some(p => p.id === patient.id)) return prev;
        return [...prev, patient];
      });
    } catch (e) {
      console.error("Failed to connect patient", e);
    }
  };

  const removeConnectedPatient = async (patientId: string) => {
    // Find patient from current state to get their raw_id
    const patientObj = connectedPatients.find(p => p.id === patientId);
    const dbPatientId = patientObj?.raw_id || patientId;
    
    try {
      await fetchWithAuth(`/api/patients/${dbPatientId}/disconnect`, {
        method: 'POST'
      });
      setConnectedPatientsState(prev => prev.filter(p => p.id !== patientId));
    } catch (e) {
      console.error("Failed to disconnect patient", e);
    }
  };

  const clearConnectedPatients = () => {
    setConnectedPatientsState([]);
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
    setConnectedPatientsState([]);
    setConnectedDoctorState(null);
    localStorage.removeItem('connectedPatients');
    localStorage.removeItem('connectedDoctor');
  };

  return (
    <ConnectionContext.Provider value={{ 
      connectedPatients, 
      connectedDoctor, 
      addConnectedPatient, 
      removeConnectedPatient,
      clearConnectedPatients,
      setConnectedDoctor, 
      disconnectAll 
    }}>
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
