"use client"
import * as React from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type,
    duration = 3000,
    onClose
}) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 border-green-400 text-green-800';
            case 'error':
                return 'bg-red-100 border-red-400 text-red-800';
            case 'info':
                return 'bg-blue-100 border-blue-400 text-blue-800';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <Check className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'info':
                return <AlertCircle className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg border ${getBgColor()} shadow-lg max-w-xs animate-fade-in`}
            role="alert"
        >
            <div className="inline-flex items-center justify-center flex-shrink-0 mr-3">
                {getIcon()}
            </div>
            <div className="text-sm font-medium">{message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-opacity-20 hover:bg-gray-500"
                onClick={onClose}
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; type: ToastType }>>([]);
    const idCounterRef = React.useRef(0);
    
    const showToast = (message: string, type: ToastType = 'info') => {
        idCounterRef.current += 1;
        const id = `toast-${Date.now()}-${idCounterRef.current}`;
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const closeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => closeToast(toast.id)}
                />
            ))}
        </div>
    );
};

// Add to global Window interface
declare global {
    interface Window {
        showToast: (message: string, type: ToastType) => void;
    }
}