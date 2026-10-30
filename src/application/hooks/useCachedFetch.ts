import { useAuth } from '../context/AuthContext';
import useSWR, { type SWRConfiguration } from 'swr';
import { apiJson, getImpersonation } from '../../config/api';
export function useCachedFetch<T = any>(
  endpoint: string | null,
  config?: SWRConfiguration,
) {
  const { identity: user } = useAuth();
  const identity = user
    ? [
        user.auth_id,
        user.actor_id,
        user.account_id,
        user.profile_id,
        user.role,
      ].join(':')
    : 'anonymous';
  const effective = getImpersonation()?.impersonation_id || '';
  return useSWR<T>(
    endpoint ? [identity, effective, endpoint] : null,
    ([, , path]: [string, string, string]) => apiJson<T>(path),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      ...config,
    },
  );
}
