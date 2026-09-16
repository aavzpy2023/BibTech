import { useState, useMemo, useEffect } from 'react';

export function useReferencesTable(data = [], pageSize = 13) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Reset pagination when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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
        setSearchQuery,
        currentPage,
        setCurrentPage,
        paginatedData,
        totalPages,
    };
}