import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = ++toastId;
        const newToast = {
            id,
            type: 'info',
            duration: 3000,
            autoClose: true,
            ...toast,
        };
        setToasts((prev) => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message, title = 'Success') => {
        return addToast({ type: 'success', message, title });
    }, [addToast]);

    const error = useCallback((message, title = 'Error') => {
        return addToast({ type: 'error', message, title, duration: 5000 });
    }, [addToast]);

    const warning = useCallback((message, title = 'Warning') => {
        return addToast({ type: 'warning', message, title });
    }, [addToast]);

    const info = useCallback((message, title = 'Info') => {
        return addToast({ type: 'info', message, title });
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };
};


