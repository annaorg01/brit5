import React, { useState, useEffect } from 'react';
import type { AgentSummary } from '../types';

interface TickerProps {
    data: AgentSummary[];
    onClose: () => void;
}

export const Ticker: React.FC<TickerProps> = ({ data, onClose }) => {
    const [isComponentVisible, setIsComponentVisible] = useState(false);

    useEffect(() => {
        // Animate the component itself into view
        const entryTimer = setTimeout(() => setIsComponentVisible(true), 100);
        return () => clearTimeout(entryTimer);
    }, []);

    if (data.length === 0) {
        return null;
    }

    // Calculate animation duration based on the number of items to maintain a consistent speed
    const animationDuration = data.length * 4; // 4 seconds per item

    return (
        <>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee linear infinite;
                }
            `}</style>
            <div className={`fixed top-0 left-0 right-0 bg-gray-900 text-white p-2 z-50 shadow-lg flex items-center justify-between transition-transform duration-500 ease-in-out ${isComponentVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex-grow overflow-hidden">
                    <div 
                        className="animate-marquee flex"
                        style={{ animationDuration: `${animationDuration}s` }}
                    >
                        {/* Render the list of items twice to create a seamless loop */}
                        {[...data, ...data].map((agent, index) => {
                            const occurredStatus = agent.statuses['Occurred'] || { count: 0, percent: '0.0%' };
                            return (
                                <div key={`${agent.agent}-${index}`} className="flex-shrink-0 mx-4 whitespace-nowrap" aria-hidden={index >= data.length}>
                                    <span className="font-bold text-yellow-400">{agent.agent}:</span>
                                    <span className="ml-2 mr-4 text-gray-200">
                                        פגישות שהתקיימו - <span className="font-semibold text-green-400">{occurredStatus.percent}</span> / <span className="font-semibold text-gray-50">{occurredStatus.count}</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors mr-2 flex-shrink-0"
                    aria-label="הסתר טיקר"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </>
    );
};
