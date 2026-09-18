import { useState, useMemo } from 'react';

let globalSearchQuery = '';
let globalCurrentPage = 1;

export function useReferencesTable(data = [], pageSize = 13) {
    const [currentPage, setCurrentPage] = useState(globalCurrentPage);
    const [searchQuery, setSearchQuery] = useState(globalSearchQuery);

    const handleSetSearchQuery = (query) => {
        globalSearchQuery = query;
        setSearchQuery(query);
        globalCurrentPage = 1;
        setCurrentPage(1);
    };

    const handleSetCurrentPage = (updater) => {
        setCurrentPage((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            globalCurrentPage = next;
            return next;
        });
    };

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) {
            return data;
        }
        const query = searchQuery.toLowerCase();
        return data.filter((item) => {
            return Object.values(item).some((val) => {
                if (val === null || val === undefined) return false;
                if (typeof val === 'object') {
                    return JSON.stringify(val).toLowerCase().includes(query);
                }
                return String(val).toLowerCase().includes(query);
            });
        });
    }, [data, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize]);

    return {
        searchQuery,
        setSearchQuery: handleSetSearchQuery,
        currentPage,
        setCurrentPage: handleSetCurrentPage,
        paginatedData,
        totalPages,
    };
}