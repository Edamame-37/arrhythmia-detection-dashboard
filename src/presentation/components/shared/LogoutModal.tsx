import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleConfirm = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_role');
        navigate('/', { state: { logoutSuccess: true } });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-sm overflow-hidden animate-in zoom-in-50 fade-in duration-500 ease-spring"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-alert-red/10 text-alert-red rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[32px]">logout</span>
                    </div>
                    <h2 className="text-xl font-bold text-charcoal mb-2">Konfirmasi Keluar</h2>
                    <p className="text-sm text-charcoal/70">
                        Apakah Anda yakin ingin keluar dari aplikasi? Sesi Anda akan berakhir.
                    </p>
                </div>
                <div className="bg-white px-6 py-5 border-t border-outline-variant/30 flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm text-charcoal bg-white hover:bg-gray-50 transition-colors border border-gray-200 outline-none"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-alert-red hover:bg-red-600 transition-colors shadow-sm outline-none"
                    >
                        Ya, Keluar
                    </button>
                </div>
            </div>
        </div>
    );
};
