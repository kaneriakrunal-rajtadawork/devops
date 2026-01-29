'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useFetchMembers - Custom hook to fetch repository members
 * 
 * @param {string} repoId - Repository ID to fetch members for
 * @param {Object} options - Configuration options
 * @param {string} options.apiEndpoint - API endpoint type: 'ems-kanban-sync' or 'repos' (default: 'ems-kanban-sync')
 * @returns {Object} { members, isLoading, error, refetch }
 */
const useFetchMembers = (repoId, options = {}) => {
    const { apiEndpoint = 'ems-kanban-sync' } = options;

    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMembers = useCallback(async () => {
        if (!repoId) {
            setMembers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Determine the API endpoint based on the option
            const url = apiEndpoint === 'ems-kanban-sync'
                ? `/api/ems-kanban-sync/repos/${repoId}`
                : `/api/repos/${repoId}/members`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch members');

            const data = await response.json();

            let membersList = [];

            if (apiEndpoint === 'ems-kanban-sync') {
                // Parse response from ems-kanban-sync endpoint
                const parsedData = data?.data?.doc;

                membersList = (parsedData?.members || []).map(member => ({
                    _id: member.user?._id || member._id,
                    name: member.user?.name || member.email || 'Unknown',
                    email: member.email,
                    userId: member.user?._id || member._id,
                }));

                // Add scrum master if exists
                if (parsedData?.scrumMaster) {
                    membersList.push({
                        _id: parsedData.scrumMaster._id,
                        name: parsedData.scrumMaster.name,
                        email: parsedData.scrumMaster.email,
                        userId: parsedData.scrumMaster._id,
                    });
                }

                if(parsedData?.lead) {
                    membersList.push({
                        _id: parsedData.lead._id,
                        name: parsedData.lead.name,
                        email: parsedData.lead.email,
                        userId: parsedData.lead._id
                    })
                }
            } else {
                // Parse response from repos/:id/members endpoint
                membersList = (data?.members || []).map(member => ({
                    _id: member.user?._id || member._id,
                    name: member.user?.name || member.name || 'Unknown',
                    email: member.email,
                    userId: member.user?._id || member._id,
                }));
            }

            // Remove duplicates by _id
            const uniqueMembers = membersList.filter(
                (member, index, self) => index === self.findIndex(m => m._id === member._id)
            );

            setMembers(uniqueMembers);
        } catch (err) {
            console.error('Error fetching repo members:', err);
            setError(err.message || 'Failed to fetch members');
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    }, [repoId, apiEndpoint]);

    // Fetch members when repoId changes
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return {
        members,
        isLoading,
        error,
        refetch: fetchMembers,
    };
};

export default useFetchMembers;
