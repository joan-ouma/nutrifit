import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, toast.duration || 3000);
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    };

    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
    };

    const Icon = icons[toast.type] || Info;
    const bgColor = colors[toast.type] || colors.info;

    return (
        <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-md animate-slideInRight mb-4`}>
            <Icon size={24} className="flex-shrink-0" />
            <div className="flex-1">
                {toast.title && <div className="font-bold mb-1">{toast.title}</div>}
                <div className="text-sm">{toast.message}</div>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
                <X size={20} />
            </button>
        </div>
    );
};

export default Toast;


