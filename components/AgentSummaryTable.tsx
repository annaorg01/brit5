import React from 'react';
import type { AgentSummary, SortState } from '../types';
import { STATUS_DISPLAY_MAP, STATUS_SORT_ORDER, HEADER_TOOLTIPS } from '../constants';

interface AgentSummaryTableProps {
    data: AgentSummary[];
    onAgentSelect: (agentName: string) => void;
    onSort: (column: keyof AgentSummary['statuses'] | 'agent' | 'totalLeads') => void;
    sortState: SortState;
    uniqueStatuses: string[];
}

const SortIndicator: React.FC<{ column: string | symbol, sortState: SortState }> = ({ column, sortState }) => {
    if (sortState.column !== column) return null;
    return <span>{sortState.direction === 'asc' ? '↑' : '↓'}</span>;
};

export const AgentSummaryTable: React.FC<AgentSummaryTableProps> = ({ data, onAgentSelect, onSort, sortState, uniqueStatuses }) => {
    
    const sortedUniqueStatuses = React.useMemo(() => {
        return [...uniqueStatuses].sort((a, b) => (STATUS_SORT_ORDER[a] || 99) - (STATUS_SORT_ORDER[b] || 99));
    }, [uniqueStatuses]);

    if (data.length === 0) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center text-xl text-gray-500">
                אין נתונים התואמים את המסננים שבחרת.
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full border-separate" style={{borderSpacing: 0}}>
                <thead className="bg-gray-800 text-white sticky top-0 z-10">
                    <tr>
                        <th className="p-3 text-right font-bold cursor-pointer relative group" onClick={() => onSort('agent')}>
                             <span>שם המתאם <SortIndicator column="agent" sortState={sortState} /></span>
                             <div className="absolute bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 invisible group-hover:visible text-right" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                                <p className="font-bold border-b border-gray-600 pb-1 mb-1">שדה מקור: <span className="font-normal font-mono text-xs break-all">{HEADER_TOOLTIPS.agent.field}</span></p>
                                <p className="font-bold mt-2">לוגיקת חישוב: <span className="font-normal">{HEADER_TOOLTIPS.agent.logic}</span></p>
                            </div>
                        </th>
                        <th className="p-3 text-right font-bold cursor-pointer relative group" onClick={() => onSort('totalLeads')}>
                            <span>סה"כ לידים <SortIndicator column="totalLeads" sortState={sortState} /></span>
                            <div className="absolute bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 invisible group-hover:visible text-right" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                                <p className="font-bold border-b border-gray-600 pb-1 mb-1">שדה מקור: <span className="font-normal font-mono text-xs break-all">{HEADER_TOOLTIPS.totalLeads.field}</span></p>
                                <p className="font-bold mt-2">לוגיקת חישוב: <span className="font-normal">{HEADER_TOOLTIPS.totalLeads.logic}</span></p>
                            </div>
                        </th>
                        {sortedUniqueStatuses.map(status => {
                             const statusDisplayName = STATUS_DISPLAY_MAP[status] || status;
                             const tooltipContent = {
                                 field: HEADER_TOOLTIPS.status_template.field,
                                 logic: HEADER_TOOLTIPS.status_template.logic.replace('{status}', `"${statusDisplayName}"`)
                             };
                            return (
                                <th key={status} className="p-3 text-right font-bold cursor-pointer relative group" onClick={() => onSort(status)}>
                                    <span>{statusDisplayName} %/# <SortIndicator column={status} sortState={sortState} /></span>
                                    <div className="absolute bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 invisible group-hover:visible text-right" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                                        <p className="font-bold border-b border-gray-600 pb-1 mb-1">שדה מקור: <span className="font-normal font-mono text-xs break-all">{tooltipContent.field}</span></p>
                                        <p className="font-bold mt-2">לוגיקת חישוב: <span className="font-normal">{tooltipContent.logic}</span></p>
                                    </div>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data.map((agent, index) => (
                        <tr key={agent.agent} className={`hover:bg-gray-100 text-gray-800 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="p-3 border-b border-gray-200">
                                <span 
                                    onClick={() => onAgentSelect(agent.agent)}
                                    className="font-bold text-blue-600 cursor-pointer hover:underline"
                                >
                                    {agent.agent}
                                </span>
                            </td>
                            <td className="p-3 border-b border-gray-200 font-extrabold">{agent.totalLeads}</td>
                            {sortedUniqueStatuses.map(status => {
                                const statusData = agent.statuses[status] || { count: 0, percent: "0.0%" };
                                let percentageColor = 'text-blue-600';
                                if (status === 'Occurred') {
                                    percentageColor = 'text-green-600';
                                } else if (status === 'לא מעוניין') {
                                    percentageColor = 'text-red-600';
                                }
                                return (
                                    <td key={status} className="p-3 border-b border-gray-200">
                                        <span className={`font-bold ${percentageColor}`}>{statusData.percent}</span>
                                        <span className="text-gray-600"> / {statusData.count}</span>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};