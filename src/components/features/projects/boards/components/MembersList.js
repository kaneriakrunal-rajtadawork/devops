'use client';

import React, { useState, useEffect } from 'react';
import { User, AlertCircle } from 'lucide-react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';

/**
 * MembersList - A reusable autocomplete component for selecting repo members
 * 
 * @param {Object} props
 * @param {string} props.repoId - Repository ID to fetch members for
 * @param {function} props.onMemberSelect - Callback when a member is selected (receives member object)
 * @param {Object} props.selectedMember - Currently selected member object
 * @param {string} props.placeholder - Placeholder text (default: "No one selected")
 * @param {boolean} props.disabled - Whether the autocomplete is disabled
 * @param {string} props.className - Additional CSS classes for the container
 */
const MembersList = ({
    repoId,
    onMemberSelect,
    selectedMember = null,
    placeholder = "No one selected",
    disabled = false,
    className = ""
}) => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inputValue, setInputValue] = useState('');

    // Fetch members when repoId changes
    useEffect(() => {
        const fetchMembers = async () => {
            if (!repoId) {
                setMembers([]);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/ems-kanban-sync/repos/${repoId}`);

                if (!response.ok) {
                    throw new Error('There was some problem fetching members.');
                }

                const data = await response.json();
                const parsedData = data?.data?.doc;
                // Extract members from the response and flatten user data
                let membersList = (parsedData?.members || []).map(member => ({
                    name: member.user?.name || member.email,
                    _id: member.user._id
                }));

                if(parsedData?.scrumMaster !== null) {
                    membersList = [...membersList, {
                        name: parsedData.scrumMaster.name || parsedData.scrumMaster.email,
                        _id: parsedData.scrumMaster._id
                    }];
                }

                if(parsedData?.lead !== null) {
                    membersList = [...membersList, {
                        name: parsedData.lead.name || parsedData.lead.email,
                        _id: parsedData.lead._id
                    }]
                }

                setMembers(membersList);
            } catch (err) {
                console.error('Error fetching members:', err);
                setError(err.message || 'Failed to load members');
                setMembers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [repoId]);

    // Handle member selection
    const handleSelect = (event, newValue) => {
        onMemberSelect?.(newValue);
    };

    // Get display name for a member
    const getMemberDisplayName = (member) => {
        if (!member) return '';
        return member.name;
    };

    return (
        <Box
            className={`inline-block ${className}`}
            onClick={(e) => e.stopPropagation()}
            sx={{ minWidth: 250 }}
        >
            <Autocomplete
                value={selectedMember}
                onChange={handleSelect}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                options={members}
                getOptionLabel={(option) => {
                    // Handle case where option is just an ID string
                    if (typeof option === 'string') {
                        const member = members.find(m => m._id === option);
                        return getMemberDisplayName(member);
                    }
                    return getMemberDisplayName(option);
                }}
                isOptionEqualToValue={(option, value) => {
                    // Handle case where value is a full member object
                    if (value?._id) {
                        return option?._id === value._id;
                    }
                    // Handle case where value is just an ID string
                    if (typeof value === 'string') {
                        return option?._id === value;
                    }
                    return false;
                }}
                disabled={disabled}
                loading={isLoading}
                loadingText="Loading members..."
                noOptionsText={error ? "Failed to load members" : "No members found"}
                size="small"
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        error={!!error}
                        helperText={error ? error : ''}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start">
                                        {error ? (
                                            <AlertCircle size={14} className="text-red-500" />
                                        ) : (
                                            <User size={14} className="text-gray-500" />
                                        )}
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                            endAdornment: (
                                <>
                                    {isLoading ? (
                                        <CircularProgress color="inherit" size={16} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                minWidth: '180px',
                                '& fieldset': {
                                    borderColor: error ? '#ef4444' : '#e5e7eb',
                                },
                                '&:hover fieldset': {
                                    borderColor: error ? '#ef4444' : '#d1d5db',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: error ? '#ef4444' : '#3b82f6',
                                    borderWidth: '1px',
                                },
                                '&.Mui-disabled': {
                                    opacity: 0.5,
                                    backgroundColor: '#f9fafb',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: '#374151',
                                '&::placeholder': {
                                    color: '#9ca3af',
                                    opacity: 1,
                                },
                            },
                            '& .MuiFormHelperText-root': {
                                marginLeft: 0,
                                fontSize: '0.75rem',
                            },
                        }}
                    />
                )}
                renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                        <Box
                            key={option.userId || option.email}
                            component="li"
                            {...otherProps}
                            sx={{
                                fontSize: '0.875rem',
                                color: '#374151',
                                padding: '8px 16px !important',
                                '&:hover': {
                                    backgroundColor: '#f3f4f6 !important',
                                },
                                '&.Mui-focused': {
                                    backgroundColor: '#f3f4f6 !important',
                                },
                            }}
                        >
                            {getMemberDisplayName(option)}
                        </Box>
                    );
                }}
                sx={{
                    '& .MuiAutocomplete-popupIndicator': {
                        color: '#6b7280',
                    },
                    '& .MuiAutocomplete-clearIndicator': {
                        color: '#6b7280',
                    },
                }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: '1px solid #e5e7eb',
                            marginTop: '4px',
                            maxHeight: '256px',
                        },
                    },
                    listbox: {
                        sx: {
                            padding: 0,
                            maxHeight: '256px',
                        },
                    },
                }}
            />
        </Box>
    );
};

export default MembersList;