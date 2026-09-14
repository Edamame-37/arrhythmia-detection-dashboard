import { supabase } from './supabaseClient';
import { API_URL } from './env';

/**
 * Custom fetch wrapper that automatically appends the Supabase JWT token
 * to the Authorization header for backend API requests.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Determine the full URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    // Get the current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        console.error('Error getting Supabase session:', error.message);
    }

    const headers = new Headers(options.headers || {});
    
    // If we have a session, append the JWT token
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    // Default to application/json if not set and body exists
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    const newOptions: RequestInit = {
        ...options,
        headers,
    };

    return fetch(url, newOptions);
}

export const getPhotoUrl = (url: string | null | undefined) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return undefined;
    
    const normalizedUrl = url.trim().replace(/\\/g, '/');
    
    // Kembalikan langsung jika merupakan base64 data image
    if (normalizedUrl.startsWith('data:image/')) {
        return normalizedUrl;
    }
    
    // Tangani path yang memiliki /uploads/
    if (normalizedUrl.includes('/uploads/')) {
        const parts = normalizedUrl.split('/uploads/');
        const subPath = parts[1].replace(/^\/+/, '');
        
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        if (baseUrl.startsWith('http')) {
            return `${baseUrl}/uploads/${subPath}`;
        }
        return `/uploads/${subPath}`;
    }
    
    if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
        return normalizedUrl;
    }
    
    const cleanPath = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return `${baseUrl}${cleanPath}`;
};
