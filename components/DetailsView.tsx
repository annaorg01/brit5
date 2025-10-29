import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { Lead, Filters, SourceDetails } from '../types';
import { 
    FIELDS, 
    AGENT_NOT_DEFINED, 
    STATUS_NOT_DEFINED, 
    STATUS_DISPLAY_MAP, 
    STATUS_SORT_ORDER,
    LAST_SOURCE_NOT_DEFINED,
    INTERESTED_IN_NOT_DEFINED
} from '../constants';
import { formatPercentage } from '../utils/dataProcessor';

interface DetailsViewProps {
    agentName: string;
    rawData: Lead[];
    currentFilters: Filters;
    uniqueStatuses: string[];
    onOpenModal: () => void;
    onClose: () => void;
}

interface DetailsSortState {
  column: string;
  direction: 'asc' | 'desc';
}

const SortIndicator: React.FC<{ column: string, sortState: DetailsSortState }> = ({ column, sortState }) => {
    if (sortState.column !== column) return null;
    return <span className="ml-1">{sortState.direction === 'asc' ? '↑' : '↓'}</span>;
};


interface DetailsTableProps {
    title: string;
    data: [string, SourceDetails][];
    totalLeads: number;
    uniqueStatuses: string[];
    groupingHeader: string;
    headerColorClass: string;
    rowColorClass: string;
    onSort: (column: string) => void;
    sortState: DetailsSortState;
}

const DetailsTable: React.FC<DetailsTableProps> = ({ title, data, totalLeads, uniqueStatuses, groupingHeader, headerColorClass, rowColorClass, onSort, sortState }) => (
    <>
        <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-1">{title}</h3>
        <div className="mb-8 overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
                <thead className={`${headerColorClass} text-white`}>
                    <tr>
                        <th className={`p-3 text-right font-bold sticky right-0 ${headerColorClass} cursor-pointer`} onClick={() => onSort('groupingKey')}>
                            {groupingHeader} <SortIndicator column="groupingKey" sortState={sortState} />
                        </th>
                        <th className="p-3 text-right font-bold cursor-pointer" onClick={() => onSort('total')}>
                            סה"כ לידים <SortIndicator column="total" sortState={sortState} />
                        </th>
                        {uniqueStatuses.map(status => (
                            <th key={status} className="p-3 text-right font-bold cursor-pointer" onClick={() => onSort(status)}>
                                {STATUS_DISPLAY_MAP[status] || status} %/# <SortIndicator column={status} sortState={sortState} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(([key, details]) => (
                        <tr key={key} className={`hover:bg-gray-100 text-gray-800 ${rowColorClass}`}>
                            <td 
                                className="p-3 font-bold border-b border-gray-200 sticky right-0 bg-inherit"
                            >
                                <span>{key}</span>
                            </td>
                            <td className="p-3 font-extrabold border-b border-gray-200">{details.total}</td>
                            {uniqueStatuses.map(status => {
                                const count = details.statuses[status] || 0;
                                const percent = formatPercentage(count, details.total);
                                let percentageColor = 'text-blue-600';
                                if (status === 'Occurred') {
                                    percentageColor = 'text-green-600';
                                } else if (status === 'לא מעוניין') {
                                    percentageColor = 'text-red-600';
                                }
                                return (
                                    <td key={status} className="p-3 border-b border-gray-200">
                                        <span className={`font-bold ${percentageColor}`}>{percent}</span>
                                        <span className="text-gray-600"> / {count}</span>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
);

export const DetailsView: React.FC<DetailsViewProps> = ({ agentName, rawData, currentFilters, uniqueStatuses, onOpenModal, onClose }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortState, setSortState] = useState<DetailsSortState>({ column: 'total', direction: 'desc' });
    
    const handleSort = useCallback((column: string) => {
        setSortState(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const sortedUniqueStatuses = useMemo(() => {
        return [...uniqueStatuses].sort((a, b) => (STATUS_SORT_ORDER[a] || 99) - (STATUS_SORT_ORDER[b] || 99));
    }, [uniqueStatuses]);

    const { totalAgentLeads, groupedData } = useMemo(() => {
        const agentLeads = rawData.filter(item => (item[FIELDS.AGENT] || AGENT_NOT_DEFINED) === agentName);
        const groupedDataMap = new Map<string, SourceDetails>();

        agentLeads.forEach(item => {
            const lastSource = (item[FIELDS.LAST_SOURCE] || LAST_SOURCE_NOT_DEFINED).trim();
            const productName = (item[FIELDS.INTERESTED_IN] || INTERESTED_IN_NOT_DEFINED).trim();
            const combinedKey = `${lastSource} - ${productName}`;

            const status = (item[FIELDS.STATUS] || STATUS_NOT_DEFINED).trim();
            
            if (!groupedDataMap.has(combinedKey)) {
                groupedDataMap.set(combinedKey, { total: 0, statuses: {} });
            }
            const entry = groupedDataMap.get(combinedKey)!;
            entry.total++;
            entry.statuses[status] = (entry.statuses[status] || 0) + 1;
        });

        const groupedDataArray = Array.from(groupedDataMap.entries());

        return { totalAgentLeads: agentLeads.length, groupedData: groupedDataArray };
    }, [agentName, rawData]);

    const sortedAndFilteredGroupedData = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        
        const filtered = lowercasedSearchTerm
            ? groupedData.filter(([combinedKey]) => {
                  const lowercasedCombinedKey = combinedKey.toLowerCase();
                  const searchTokens = lowercasedSearchTerm.split(/\s+/).filter(Boolean);
                  return searchTokens.every(token => lowercasedCombinedKey.includes(token));
              })
            : groupedData;

        return [...filtered].sort(([keyA, detailsA], [keyB, detailsB]) => {
            const { column, direction } = sortState;
            let aValue: string | number;
            let bValue: string | number;

            if (column === 'groupingKey') {
                aValue = keyA;
                bValue = keyB;
            } else if (column === 'total') {
                aValue = detailsA.total;
                bValue = detailsB.total;
            } else { 
                aValue = detailsA.statuses[column] || 0;
                bValue = detailsB.statuses[column] || 0;
            }

            const modifier = direction === 'asc' ? 1 : -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return aValue.localeCompare(bValue, 'he') * modifier;
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * modifier;
            }
            return 0;
        });
    }, [groupedData, searchTerm, sortState]);

    return (
        <div className={`relative mt-8 bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 transition-all duration-700 ease-in-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}>
            <button
                onClick={onClose}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
                aria-label={`סגירת פירוט עבור ${agentName}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">פירוט לידים עבור מתאם: {agentName}</h2>
            <p className="text-sm text-gray-600 mb-2">סה"כ {totalAgentLeads} לידים נמצאו.</p>
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <button onClick={onOpenModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto">
                    התפלגות שיחות למתאם
                </button>
                <div className="relative w-full md:w-1/2 lg:w-1/3">
                     <input
                        type="text"
                        placeholder="חיפוש חופשי לפי מקור או מוצר..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full ps-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                        aria-label="חיפוש בטבלת הפירוט"
                    />
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {sortedAndFilteredGroupedData.length > 0 ? (
                <DetailsTable 
                    title={`התפלגות לפי מקור אחרון ושם מוצר בתוך ${agentName}`}
                    data={sortedAndFilteredGroupedData}
                    totalLeads={totalAgentLeads}
                    uniqueStatuses={sortedUniqueStatuses}
                    groupingHeader="מקור אחרון - שם המוצר"
                    headerColorClass="bg-green-800"
                    rowColorClass="bg-green-100"
                    onSort={handleSort}
                    sortState={sortState}
                />
            ) : (
                <div className="text-center py-8 px-4 bg-green-50 rounded-lg">
                    <p className="text-lg text-gray-600">לא נמצאו תוצאות התואמות לחיפוש שלך.</p>
                </div>
            )}
        </div>
    );
};