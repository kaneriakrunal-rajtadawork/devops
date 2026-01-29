import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value.
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - The debounce delay in milliseconds (default: 500ms)
 * @returns {any} - The debounced value
 * 
 * @example
 * const [searchText, setSearchText] = useState('');
 * const debouncedSearch = useDebounce(searchText, 300);
 * 
 * useEffect(() => {
 *   // This will only run after the user stops typing for 300ms
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timeout to update the debounced value
        const timeoutId = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clear the timeout if value or delay changes (cleanup)
        return () => {
            clearTimeout(timeoutId);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
