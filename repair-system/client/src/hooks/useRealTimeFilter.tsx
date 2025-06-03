import { useState, useEffect, useCallback } from 'react';

interface FilterOptions<T> {
  initialData: T[];
  searchFields?: (keyof T)[];
  filters?: Record<string, any>;
  sortConfig?: { key: keyof T | null; direction: 'asc' | 'desc' };
  debounceTime?: number;
}

export function useRealTimeFilter<T extends Record<string, any>>({
  initialData,
  searchFields = [],
  filters = {},
  sortConfig = { key: null, direction: 'asc' },
  debounceTime = 300
}: FilterOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [filteredData, setFilteredData] = useState<T[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const applyFilters = useCallback(() => {
    let result = [...data];
    const activeFiltersList: string[] = [];

    // Apply search term filter across specified fields
    if (searchTerm && searchFields.length > 0) {
      const query = searchTerm.toLowerCase().trim();
      
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          } else if (typeof value === 'number') {
            return value.toString().includes(query);
          }
          return false;
        });
      });
      
      activeFiltersList.push('search');
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        result = result.filter(item => {
          if (typeof value === 'function') {
            return value(item[key]);
          }
          return item[key] === value;
        });
        activeFiltersList.push(key);
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key as keyof T] < b[sortConfig.key as keyof T]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof T] > b[sortConfig.key as keyof T]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(result);
    setActiveFilters(activeFiltersList);
  }, [data, searchTerm, filters, sortConfig, searchFields]);

  // Apply filters when search term or other filters change
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      applyFilters();
    }, debounceTime);

    setDebounceTimeout(timeout);
    
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [searchTerm, filters, sortConfig, applyFilters, debounceTime]);

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
    applyFilters();
  }, [initialData, applyFilters]);

  return {
    filteredData,
    setSearchTerm,
    searchTerm,
    activeFilters,
    resetFilters: () => {
      setSearchTerm('');
      setActiveFilters([]);
    },
    updateData: setData
  };
}