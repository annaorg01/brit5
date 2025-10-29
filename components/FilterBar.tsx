import React from 'react';
import type { FilterOptions, Filters } from '../types';
import { FIELDS, FILTER_DISPLAY_NAMES, OPTION_DISPLAY_MAP } from '../constants';

interface FilterBarProps {
    options: FilterOptions;
    filters: Filters;
    onFilterChange: (key: string, value: string) => void;
    onDateFilterChange: (key: string, from: string, to: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ options, filters, onFilterChange, onDateFilterChange }) => {
    const filterOrder = [
        FIELDS.SOURCE,
        FIELDS.AGENT,
        FIELDS.STATUS,
        FIELDS.CAMPAIGN,
        FIELDS.PRODUCT_TYPE,
        FIELDS.INTERESTED_IN,
        FIELDS.CREATED_AT,
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filterOrder.map(key => {
                const optionData = options[key];
                if (!optionData) return null;

                const displayName = FILTER_DISPLAY_NAMES[key] || key;
                
                if (key === FIELDS.CREATED_AT && typeof optionData === 'object' && 'min' in optionData) {
                    return (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{displayName}</label>
                            <div className="flex gap-2">
                                <input 
                                    type="date"
                                    value={filters[`${key}_from`] || ''}
                                    onChange={(e) => onDateFilterChange(key, e.target.value, filters[`${key}_to`])}
                                    className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                />
                                <input 
                                    type="date"
                                    value={filters[`${key}_to`] || ''}
                                    onChange={(e) => onDateFilterChange(key, filters[`${key}_from`], e.target.value)}
                                    className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                />
                            </div>
                        </div>
                    );
                }

                if(Array.isArray(optionData)) {
                    return (
                        <div key={key}>
                            <label htmlFor={`filter-${key}`} className="block text-sm font-medium text-gray-700 mb-1">{displayName}</label>
                            <select
                                id={`filter-${key}`}
                                value={filters[key] || 'הכל'}
                                onChange={(e) => onFilterChange(key, e.target.value)}
                                className="block w-full pe-10 ps-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                            >
                                <option value="הכל">הכל</option>
                                {optionData.map(option => {
                                    const optionMap = OPTION_DISPLAY_MAP[key] || {};
                                    const optionText = optionMap[option] || option;
                                    return <option key={option} value={option}>{optionText}</option>
                                })}
                            </select>
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};