export interface Lead {
    [key: string]: any;
}

export interface StatusInfo {
    count: number;
    percent: string;
}

export interface AgentSummary {
    agent: string;
    totalLeads: number;
    statuses: {
        [status: string]: StatusInfo;
    };
}

export interface FilterOptions {
    [key: string]: string[] | { min: string; max: string; } | undefined;
}

export interface Filters {
    [key: string]: string;
}

export interface SortState {
    column: keyof AgentSummary['statuses'] | 'agent' | 'totalLeads';
    direction: 'asc' | 'desc';
}

export interface SourceDetails {
    total: number;
    statuses: { [status: string]: number };
}

export interface DetailsViewProps {
    agentName: string;
    rawData: Lead[];
    currentFilters: Filters;
    uniqueStatuses: string[];
    onOpenModal: () => void;
    onClose?: () => void;
}