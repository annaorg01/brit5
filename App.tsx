import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllLeads } from './services/api';
import type { Lead, AgentSummary, FilterOptions, Filters, SortState } from './types';
import { calculateFilterOptions, applyFilters, analyzeByAgent } from './utils/dataProcessor';
import { AGENT_NOT_DEFINED, FIELDS } from './constants';
import { FilterBar } from './components/FilterBar';
import { AgentSummaryTable } from './components/AgentSummaryTable';
import { DetailsView } from './components/DetailsView';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { LookerModal } from './components/LookerModal';
import { Ticker } from './components/Ticker';

const App: React.FC = () => {
    const [rawData, setRawData] = useState<Lead[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
    const [filters, setFilters] = useState<Filters>({});
    const [sortState, setSortState] = useState<SortState>({ column: 'totalLeads', direction: 'desc' });
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isTickerVisible, setIsTickerVisible] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await fetchAllLeads();
                setRawData(data);
                const options = calculateFilterOptions(data);
                setFilterOptions(options);
                // Initialize filters
                const initialFilters: Filters = {};
                Object.keys(options).forEach(key => {
                    if (key === FIELDS.CREATED_AT) {
                        const dateOptions = options[key];
                        if (dateOptions && !Array.isArray(dateOptions)) {
                            initialFilters[`${key}_from`] = '2025-09-16';
                            initialFilters[`${key}_to`] = dateOptions.max || '';
                        }
                    } else {
                        initialFilters[key] = 'הכל';
                    }
                });
                setFilters(initialFilters);
                setError(null);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);
    
    const handleFilterChange = useCallback((key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setSelectedAgent(null); // Reset drilldown on filter change
    }, []);

    const handleDateFilterChange = useCallback((key: string, from: string, to: string) => {
        setFilters(prev => ({
            ...prev,
            [`${key}_from`]: from,
            [`${key}_to`]: to,
        }));
        setSelectedAgent(null);
    }, []);

    const handleSort = useCallback((column: keyof AgentSummary['statuses'] | 'agent' | 'totalLeads') => {
        setSortState(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    }, []);
    
    const handleAgentSelect = useCallback((agentName: string) => {
        if (agentName === 'מוזה') {
            // Special easter egg from original code
             const utterance = new SpeechSynthesisUtterance("מוזה");
             utterance.lang = "he-IL";
             speechSynthesis.speak(utterance);
        }
        setSelectedAgent(agentName);
    }, []);

    const filteredData = useMemo(() => applyFilters(rawData, filters), [rawData, filters]);
    const agentSummaryData = useMemo(() => analyzeByAgent(filteredData), [filteredData]);

    const sortedAgentSummaryData = useMemo(() => {
        return [...agentSummaryData].sort((a, b) => {
            const { column, direction } = sortState;
            let aValue: string | number;
            let bValue: string | number;

            if (column === 'agent') {
                aValue = a.agent;
                bValue = b.agent;
            } else if (column === 'totalLeads') {
                aValue = a.totalLeads;
                bValue = b.totalLeads;
            } else {
                aValue = a.statuses[column]?.count || 0;
                bValue = b.statuses[column]?.count || 0;
            }
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [agentSummaryData, sortState]);

    const tickerData = useMemo(() => {
        const excludedNames = new Set(['BARAK B', 'Yehonatan', 'Adi', 'SAPIR', 'Barak M']);
        return sortedAgentSummaryData.filter(agent => !excludedNames.has(agent.agent.trim()));
    }, [sortedAgentSummaryData]);

    const uniqueStatuses = useMemo(() => {
        const statuses = new Set<string>();
        rawData.forEach(item => {
            statuses.add((item[FIELDS.STATUS] || 'לא מעוניין').trim());
        });
        return Array.from(statuses);
    }, [rawData]);

    return (
        <div className="p-4 lg:p-8 max-w-full mx-auto">
            {isTickerVisible && tickerData.length > 0 && (
                <Ticker 
                    data={tickerData} 
                    onClose={() => setIsTickerVisible(false)} 
                />
            )}
            {isTickerVisible && <div className="h-10"></div>}
            
            <header className="mb-6 pb-2 border-b">
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">ניתוח ביצועי מתאמים לפי סטטוס פגישה</h1>
                        <p className="text-gray-600 mt-1 text-xs">טבלה זו מציגה את התפלגות כלל הלידים של כל מתאם לפי סטטוס פגישה, כולל חיתוך לפי ספק.</p>
                    </div>
                    {!isTickerVisible && !loading && !error && tickerData.length > 0 && (
                         <button
                            onClick={() => setIsTickerVisible(true)}
                            className="text-xs bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded-full hover:bg-gray-300 transition-colors whitespace-nowrap"
                            aria-label="הצג טיקר"
                          >
                            הצג טיקר
                          </button>
                    )}
                </div>
            </header>

            <FilterBar 
                options={filterOptions} 
                filters={filters}
                onFilterChange={handleFilterChange} 
                onDateFilterChange={handleDateFilterChange} 
            />

            {loading && <Loader />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && (
                <>
                    <AgentSummaryTable
                        data={sortedAgentSummaryData}
                        onAgentSelect={handleAgentSelect}
                        onSort={handleSort}
                        sortState={sortState}
                        uniqueStatuses={uniqueStatuses}
                    />
                    {selectedAgent && (
                        <DetailsView
                            key={selectedAgent}
                            agentName={selectedAgent}
                            rawData={rawData}
                            currentFilters={filters}
                            uniqueStatuses={uniqueStatuses}
                            onOpenModal={() => setIsModalOpen(true)}
                            onClose={() => setSelectedAgent(null)}
                        />
                    )}
                </>
            )}
             <LookerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default App;