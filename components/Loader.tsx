
import React from 'react';

export const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-semibold">
            טוען נתונים מה-API (ייתכן שייקח כמה שניות)...
        </p>
    </div>
);
