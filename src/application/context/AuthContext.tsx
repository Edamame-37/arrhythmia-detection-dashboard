import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SWRConfig } from 'swr';
import { supabase, isSupabaseConfigured } from '../../config/supabaseClient';
import { apiJson, ApiError, getImpersonation } from '../../config/api';
import type { AuthIdentity } from '../../core/types/apiTypes';
import { readStored } from '../../core/utils/storage';
interface AuthState {
  identity: AuthIdentity | null;
  loading: boolean;
  error: string | null;
  refreshIdentity: () => Promise<AuthIdentity | null>;
}
const AuthContext = createContext<AuthState>({
  identity: null,
  loading: true,
  error: null,
  refreshIdentity: async () => null,
});
const clearLegacyIdentity = () => {
  for (const key of [
    'user_id',
    'user_role',
    'profile_id',
    'auth_token',
    'admin_auth_token',
    'admin_user_id',
    'doctor_auth_token',
    'doctor_user_id',
    'original_role',
    'connectedPatients',
    'connectedDoctor',
    'synced_device_id',
    'mock_patient_profile',
  ])
    localStorage.removeItem(key);
};
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestNumber = useRef(0);
  const refreshIdentity = useCallback(async () => {
    const request = ++requestNumber.current;
    try {
      if (!isSupabaseConfigured)
        throw new Error('Konfigurasi autentikasi belum lengkap');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        clearLegacyIdentity();
        sessionStorage.removeItem('ecg_impersonation');
        if (request === requestNumber.current) setIdentity(null);
        return null;
      }
      let result: AuthIdentity;
      try {
        result = await apiJson<AuthIdentity>('/api/auth/me');
      } catch (problem) {
        const pending = readStored<any>(
          sessionStorage,
          'ecg_pending_profile',
          null,
        );
        if (
          !(problem instanceof ApiError) ||
          problem.status !== 403 ||
          !pending ||
          pending.email !== session.user.email
        )
          throw problem;
        await apiJson('/api/auth/register_profile', {
          method: 'POST',
          body: JSON.stringify(pending),
        });
        sessionStorage.removeItem('ecg_pending_profile');
        result = await apiJson<AuthIdentity>('/api/auth/me');
      }
      if (request !== requestNumber.current) return null;
      clearLegacyIdentity();
      localStorage.setItem('user_id', result.account_id);
      localStorage.setItem('profile_id', result.profile_id);
      localStorage.setItem('user_role', result.role);
      setIdentity(result);
      setError(null);
      return result;
    } catch (problem) {
      if (request === requestNumber.current) {
        clearLegacyIdentity();
        setIdentity(null);
        setError(
          problem instanceof Error
            ? problem.message
            : 'Gagal memverifikasi sesi',
        );
      }
      return null;
    } finally {
      if (request === requestNumber.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Reconcile the external Auth session on mount.
    void refreshIdentity();
    const subscription = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        void refreshIdentity();
      }, 0);
    });
    const changed = () => {
      setLoading(true);
      void refreshIdentity();
    };
    window.addEventListener('ecg_identity_changed', changed);
    const cancelPending = () => {
      requestNumber.current++;
    };
    return () => {
      cancelPending();
      subscription.data.subscription.unsubscribe();
      window.removeEventListener('ecg_identity_changed', changed);
    };
  }, [refreshIdentity]);
  const cacheIdentity = identity
    ? [
        identity.auth_id,
        identity.actor_id,
        identity.account_id,
        identity.profile_id,
        identity.role,
        getImpersonation()?.impersonation_id || '',
      ].join(':')
    : 'anonymous';
  return (
    <AuthContext.Provider value={{ identity, loading, error, refreshIdentity }}>
      <SWRConfig key={cacheIdentity} value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
