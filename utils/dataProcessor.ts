
import type { Lead, AgentSummary, FilterOptions, Filters } from '../types';
import { FIELDS, AGENT_NOT_DEFINED, STATUS_NOT_DEFINED, SOURCE_NOT_DEFINED, STATUS_SORT_ORDER, PRODUCT_TYPE_NOT_DEFINED } from '../constants';

const mapSource = (source: any): string => {
    const s = String(source || SOURCE_NOT_DEFINED).trim();
    if (s === "Voicenter Leads" || s === "שיחה נכנסת") {
        return "שיחה נכנסת";
    }
    return s;
};

export const formatPercentage = (value: number, total: number): string => {
    if (total === 0 || !total) return "0.0%";
    return ((value / total) * 100).toFixed(1) + "%";
};

export const getConversionColor = (percentage: number): string => {
    if (percentage >= 20) return "";
    if (percentage >= 5) return "text-amber-500";
    return "text-red-500";
};

export const calculateFilterOptions = (data: Lead[]): FilterOptions => {
    const options: { [key: string]: Set<string> } = {
        [FIELDS.SOURCE]: new Set(),
        [FIELDS.AGENT]: new Set(),
        [FIELDS.STATUS]: new Set(),
        [FIELDS.CAMPAIGN]: new Set(),
        [FIELDS.INTERESTED_IN]: new Set(),
        [FIELDS.PRODUCT_TYPE]: new Set(),
    };

    data.forEach(item => {
        options[FIELDS.SOURCE].add(mapSource(item[FIELDS.SOURCE]));
        options[FIELDS.AGENT].add(item[FIELDS.AGENT] || AGENT_NOT_DEFINED);
        options[FIELDS.STATUS].add((item[FIELDS.STATUS] || STATUS_NOT_DEFINED).trim());
        if(item[FIELDS.CAMPAIGN]) options[FIELDS.CAMPAIGN].add(String(item[FIELDS.CAMPAIGN]).trim());
        if(item[FIELDS.INTERESTED_IN]) options[FIELDS.INTERESTED_IN].add(String(item[FIELDS.INTERESTED_IN]).trim());
        options[FIELDS.PRODUCT_TYPE].add((item[FIELDS.PRODUCT_TYPE] || PRODUCT_TYPE_NOT_DEFINED).trim());
    });

    const filterOptions: FilterOptions = {};
    for (const key in options) {
        filterOptions[key] = Array.from(options[key]).sort((a, b) => {
            if (key === FIELDS.STATUS) {
                 return (STATUS_SORT_ORDER[a] || 99) - (STATUS_SORT_ORDER[b] || 99);
            }
            return a.localeCompare(b, 'he');
        });
    }

    const dates = data.map(item => item[FIELDS.CREATED_AT]).filter(date => date).sort();
    if (dates.length > 0) {
        filterOptions[FIELDS.CREATED_AT] = {
            min: dates[0].split(' ')[0],
            max: dates[dates.length - 1].split(' ')[0],
        };
    }
    
    return filterOptions;
};


export const applyFilters = (data: Lead[], filters: Filters): Lead[] => {
    return data.filter(item => {
        for (const key in filters) {
            if (key.endsWith('_from') || key.endsWith('_to')) continue;
            
            const filterValue = filters[key];
            if (filterValue === 'הכל' || !filterValue) continue;

            let itemValue: string;
            switch(key) {
                case FIELDS.SOURCE:
                    itemValue = mapSource(item[FIELDS.SOURCE]);
                    break;
                case FIELDS.AGENT:
                    itemValue = item[FIELDS.AGENT] || AGENT_NOT_DEFINED;
                    break;
                case FIELDS.STATUS:
                    itemValue = (item[FIELDS.STATUS] || STATUS_NOT_DEFINED).trim();
                    break;
                case FIELDS.PRODUCT_TYPE:
                    itemValue = (item[FIELDS.PRODUCT_TYPE] || PRODUCT_TYPE_NOT_DEFINED).trim();
                    break;
                default:
                    itemValue = String(item[key] || '').trim();
            }

            if (itemValue !== filterValue) return false;
        }

        const fromDate = filters[`${FIELDS.CREATED_AT}_from`];
        const toDate = filters[`${FIELDS.CREATED_AT}_to`];

        if (fromDate || toDate) {
            const itemDateStr = item[FIELDS.CREATED_AT];
            if (!itemDateStr) return false; // Exclude items without a date if filtering by date

            const itemDate = itemDateStr.split(' ')[0];
            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
        }

        return true;
    });
};

export const analyzeByAgent = (filteredData: Lead[]): AgentSummary[] => {
    const agentMap = new Map<string, AgentSummary>();

    filteredData.forEach(item => {
        const agentName = item[FIELDS.AGENT] || AGENT_NOT_DEFINED;
        if (!agentMap.has(agentName)) {
            agentMap.set(agentName, {
                agent: agentName,
                totalLeads: 0,
                statuses: {},
            });
        }

        const agentEntry = agentMap.get(agentName)!;
        agentEntry.totalLeads++;
        
        const status = (item[FIELDS.STATUS] || STATUS_NOT_DEFINED).trim();
        if (!agentEntry.statuses[status]) {
            agentEntry.statuses[status] = { count: 0, percent: '0.0%' };
        }
        agentEntry.statuses[status].count++;
    });

    agentMap.forEach(agent => {
        for (const status in agent.statuses) {
            agent.statuses[status].percent = formatPercentage(agent.statuses[status].count, agent.totalLeads);
        }
    });

    return Array.from(agentMap.values());
};