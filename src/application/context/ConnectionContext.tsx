import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { apiJson } from '../../config/api';
export interface ConnectedPatient {
  id: string;
  name: string;
  profile_photo?: string;
  connectedAt: string;
  raw_id?: string;
  code?: string;
}
export interface ConnectedDoctor {
  id?: string;
  name: string;
  hospital: string;
  photo?: string;
}
interface ConnectionState {
  connectedPatients: ConnectedPatient[];
  connectedDoctor: ConnectedDoctor | null;
  addConnectedPatient: (patient: ConnectedPatient) => Promise<void>;
  removeConnectedPatient: (id: string) => Promise<void>;
  clearConnectedPatients: () => void;
  setConnectedDoctor: (doctor: ConnectedDoctor | null) => void;
  disconnectAll: () => Promise<void>;
}
const ConnectionContext = createContext<ConnectionState | undefined>(undefined);
export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { identity } = useAuth();
  const { data: doctorPatients, mutate: refreshPatients } = useCachedFetch(
    identity?.role === 'dokter'
      ? '/api/doctors/' + identity.profile_id + '/patients?limit=100'
      : null,
    { refreshInterval: 5000 },
  );
  const { data: patientProfile, mutate: refreshPatient } = useCachedFetch(
    identity?.role === 'pasien' ? '/api/patients/' + identity.profile_id : null,
    { refreshInterval: 5000 },
  );
  const connectedPatients = useMemo<ConnectedPatient[]>(
    () =>
      (doctorPatients?.data || []).map((patient: any) => ({
        id: patient.id,
        raw_id: patient.id,
        name: patient.name,
        profile_photo: patient.profile_photo,
        connectedAt: '',
      })),
    [doctorPatients],
  );
  const doctor = patientProfile?.doctor;
  const connectedDoctor: ConnectedDoctor | null = doctor
    ? {
        id: doctor.id,
        name: 'Dr. ' + doctor.first_name + ' ' + doctor.last_name,
        hospital: '',
        photo: doctor.profile_photo,
      }
    : null;
  const addConnectedPatient = async (patient: ConnectedPatient) => {
    if (!identity) throw new Error('Sesi tidak tersedia');
    await apiJson(
      '/api/patients/' + (patient.raw_id || patient.id) + '/connect',
      {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: identity.profile_id,
          code: patient.code,
        }),
      },
    );
    await refreshPatients();
  };
  const removeConnectedPatient = async (id: string) => {
    await apiJson('/api/patients/' + id + '/disconnect', { method: 'POST' });
    await Promise.all([refreshPatients(), refreshPatient()]);
  };
  const disconnectAll = async () => {
    if (identity?.role === 'pasien')
      await removeConnectedPatient(identity.profile_id);
    else
      for (const patient of connectedPatients)
        await removeConnectedPatient(patient.id);
  };
  return (
    <ConnectionContext.Provider
      value={{
        connectedPatients,
        connectedDoctor,
        addConnectedPatient,
        removeConnectedPatient,
        clearConnectedPatients: () => {
          void refreshPatients();
        },
        setConnectedDoctor: () => {
          void refreshPatient();
        },
        disconnectAll,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
export const useConnection = () => {
  const value = useContext(ConnectionContext);
  if (!value) throw new Error('ConnectionProvider is required');
  return value;
};
