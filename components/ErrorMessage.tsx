
import React from 'react';

interface ErrorMessageProps {
    message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl" role="alert">
        <p className="font-bold">שגיאה באחזור הנתונים</p>
        <p className="text-sm mt-1">{message}</p>
        <p className="text-xs mt-2">אנא ודא שמפתח ה-API תקין ושהרשת תקינה.</p>
    </div>
);
