import { useSearchParams } from 'react-router-dom';

export function useUrlState<T>(
    key: string,
    defaultValue: T,
    parser: (val: string) => T = (v) => v as unknown as T,
    serializer: (val: T) => string = (v) => String(v)
): [T, (val: T | ((prev: T) => T)) => void] {
    const [searchParams, setSearchParams] = useSearchParams();

    const rawValue = searchParams.get(key);
    const value: T = rawValue !== null ? parser(rawValue) : defaultValue;

    const setValue = (newValue: T | ((prev: T) => T)) => {
        setSearchParams(prevParams => {
            const nextParams = new URLSearchParams(prevParams);
            const resolvedValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(value) : newValue;
            
            if (resolvedValue === defaultValue || resolvedValue === null || resolvedValue === undefined || resolvedValue === '') {
                nextParams.delete(key);
            } else {
                nextParams.set(key, serializer(resolvedValue));
            }
            return nextParams;
        });
    };

    return [value, setValue];
}
