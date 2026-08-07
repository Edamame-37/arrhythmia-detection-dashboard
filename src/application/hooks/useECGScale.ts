import { useState, useEffect } from 'react';

const SCALE_KEY = 'ecg_physical_scale';

export const useECGScale = () => {
    const [scale, setScale] = useState<number>(1.0);

    useEffect(() => {
        const savedScale = localStorage.getItem(SCALE_KEY);
        if (savedScale) {
            const parsed = parseFloat(savedScale);
            if (!isNaN(parsed) && parsed > 0) {
                setScale(parsed);
            }
        }
    }, []);

    const saveScale = (newScale: number) => {
        setScale(newScale);
        localStorage.setItem(SCALE_KEY, newScale.toString());
    };

    const resetScale = () => {
        setScale(1.0);
        localStorage.removeItem(SCALE_KEY);
    };

    return { scale, saveScale, resetScale };
};
