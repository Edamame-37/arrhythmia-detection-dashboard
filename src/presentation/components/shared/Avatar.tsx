import React, { useState, useEffect } from 'react';
import { getPhotoUrl } from '../../../config/api';

export interface AvatarProps {
  /** URL foto profil (bisa path relatif, absolut, atau base64) */
  src?: string | null;
  /** Nama lengkap untuk diekstrak menjadi inisial (misal "Patient Test" -> "PT") */
  name?: string;
  /** Ukuran avatar preset atau kelas kustom */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  /** Kelas Tailwind tambahan untuk styling kontainer */
  className?: string;
  /** Ikon Material Symbols alternatif jika inisial tidak tersedia */
  iconFallback?: string;
  /** Aksesibilitas judul/label avatar */
  title?: string;
}

const SIZE_MAP: Record<string, { container: string; text: string; icon: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', icon: 'text-[14px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs', icon: 'text-[18px]' },
  md: { container: 'w-10 h-10', text: 'text-sm', icon: 'text-[22px]' },
  lg: { container: 'w-12 h-12', text: 'text-base', icon: 'text-[26px]' },
  xl: { container: 'w-16 h-16', text: 'text-lg', icon: 'text-[32px]' },
  '2xl': { container: 'w-32 h-32', text: 'text-2xl', icon: 'text-[64px]' },
};

/**
 * Komponen Avatar Terstandarisasi
 * 
 * Menjamin tampilan foto profil tidak pernah rusak dengan ikon patah browser
 * atau teks alt yang tumpang tindih. Menggunakan fallback inisial nama atau
 * ikon Material Symbol yang konsisten dengan tema desain klinis.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  className = '',
  iconFallback = 'person',
  title,
}) => {
  const [hasError, setHasError] = useState(false);

  // Normalisasi URL foto
  const resolvedUrl = getPhotoUrl(src);

  // Reset status error ketika src berganti
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Hitung inisial nama jika ada
  const initials = React.useMemo(() => {
    if (!name || typeof name !== 'string') return '';
    const cleanName = name.trim().replace(/^(Dr\.|Dokter)\s+/i, '');
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [name]);

  // Resolusi ukuran kontainer
  const sizeConfig = SIZE_MAP[size] || {
    container: size.startsWith('w-') ? size : 'w-10 h-10',
    text: 'text-sm',
    icon: 'text-[20px]',
  };

  const shouldRenderImage = Boolean(resolvedUrl && !hasError);

  return (
    <div
      title={title || name}
      className={`relative rounded-full overflow-hidden flex items-center justify-center font-bold select-none shrink-0 border border-clinical-charcoal/10 bg-clinical-surface text-clinical-blue transition-all ${sizeConfig.container} ${className}`}
    >
      {shouldRenderImage ? (
        <img
          src={resolvedUrl}
          alt="" // Dikosongkan dengan sengaja agar browser tidak merender teks alt jika terjadi glitch muat
          aria-hidden="true"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : initials ? (
        <span className={`${sizeConfig.text} tracking-wider font-extrabold uppercase`}>
          {initials}
        </span>
      ) : (
        <span className={`material-symbols-outlined text-clinical-charcoal/40 ${sizeConfig.icon}`}>
          {iconFallback}
        </span>
      )}
    </div>
  );
};
