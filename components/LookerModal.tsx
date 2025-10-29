
import React from 'react';

interface LookerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LookerModal: React.FC<LookerModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 md:w-3/4 md:h-3/4 flex flex-col"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="p-4 bg-gray-800 text-white flex justify-between items-center rounded-t-lg">
                    <h3 className="text-lg font-semibold">התפלגות שיחות למתאם</h3>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>
                <div className="flex-grow p-1">
                    <iframe
                        src="https://lookerstudio.google.com/embed/reporting/24a6f802-eea0-43d2-afa4-8ec5d984b32f/page/fSHcF"
                        className="w-full h-full border-none"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};
