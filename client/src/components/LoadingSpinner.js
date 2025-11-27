import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 24, className = '' }) => {
    return (
        <Loader2 
            className={`animate-spin text-emerald-600 ${className}`} 
            size={size} 
        />
    );
};

export default LoadingSpinner;


