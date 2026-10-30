export type UserRole = 'admin' | 'dokter' | 'pasien';
export interface AuthIdentity {
  auth_id: string;
  account_id: string;
  profile_id: string;
  role: UserRole;
  actor_id: string;
}
export interface ImpersonationContext {
  impersonation_id: string;
  user_id: string;
  account_id: string;
  profile_id: string;
  role: UserRole;
}
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
export interface PageResponse<T> {
  data: T[];
  pagination: Pagination;
}
export interface RecordingSession {
  session_id: string;
  device_id: string;
  state: 'requested' | 'recording' | 'stopping';
  started_at: string;
}
