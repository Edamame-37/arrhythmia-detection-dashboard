import { useEffect, useState } from 'react';
import { readStored } from '../../core/utils/storage';
export function useStickyState<T>(
  defaultValue: T,
  key: string,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const scopedKey =
    (localStorage.getItem('user_id') || 'anonymous') + ':' + key;
  const [value, setValue] = useState<T>(() =>
    readStored(sessionStorage, scopedKey, defaultValue),
  );
  useEffect(() => {
    sessionStorage.setItem(scopedKey, JSON.stringify(value));
  }, [scopedKey, value]);
  return [value, setValue];
}
