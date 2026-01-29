'use client';

import React, { useState } from 'react';
import {
    Popover,
    Switch,
    Radio,
    RadioGroup,
    FormControlLabel,
    createTheme,
    ThemeProvider,
    Fade,
} from '@mui/material';
import Tooltip from '@/components/ui/Tooltip';

// Custom MUI theme to match Azure DevOps styling
const settingsTheme = createTheme({
    components: {
        MuiSwitch: {
            styleOverrides: {
                root: {
                    width: 44,
                    height: 24,
                    padding: 0,
                },
                switchBase: {
                    padding: 2,
                    '&.Mui-checked': {
                        transform: 'translateX(20px)',
                        color: '#fff',
                        '& + .MuiSwitch-track': {
                            backgroundColor: '#0078d4',
                            opacity: 1,
                            border: 0,
                        },
                    },

                },
                thumb: {
                    width: 20,
                    height: 20,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                },
                track: {
                    borderRadius: 12,
                    backgroundColor: '#d1d5db',
                    opacity: 1,
                },
            },
        },
        MuiRadio: {
            styleOverrides: {
                root: {
                    padding: 4,
                    color: '#6b7280',
                    '&.Mui-checked': {
                        color: '#0078d4',
                    },
                },
            },
        },
        MuiFormControlLabel: {
            styleOverrides: {
                root: {
                    marginLeft: 0,
                    marginRight: 0,
                },
                label: {
                    fontSize: '14px',
                    color: '#374151',
                },
            },
        },
    },
});

/**
 * BacklogSettingsPopover - Settings popover for backlog view
 * Contains toggles for view options matching Azure DevOps design
 */
const BacklogSettingsPopover = ({
    anchorEl,
    open,
    onClose,
    settings = {},
    onSettingsChange,
}) => {
    // Default settings
    const defaultSettings = {
        inProgressItems: true,
        completedChildItems: false,
        keepHierarchyWithFilters: true,
        sidePane: 'off',
        ...settings,
    };

    const [localSettings, setLocalSettings] = useState(defaultSettings);

    const handleToggleChange = (key) => (event) => {
        const newSettings = {
            ...localSettings,
            [key]: event.target.checked,
        };
        setLocalSettings(newSettings);
        onSettingsChange?.(newSettings);
    };

    const handleSidePaneChange = (event) => {
        const newSettings = {
            ...localSettings,
            sidePane: event.target.value,
        };
        setLocalSettings(newSettings);
        onSettingsChange?.(newSettings);
    };

    return (
        <ThemeProvider theme={settingsTheme}>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={onClose}
                TransitionComponent={Fade}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                            borderRadius: '4px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                            minWidth: 260,
                        },
                    },
                }}
            >
                <div className="py-3 px-4">
                    {/* In Progress Items */}
                    <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-900 mb-0.5">
                            In Progress Items
                        </div>
                                               <div className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer transition-colors py-2">
                             <Tooltip title="Show or hide work items in the In Progress state">
                            <Switch
                                checked={localSettings.inProgressItems}
                                onChange={handleToggleChange('inProgressItems')}
                                size="small"
                            />
                            </Tooltip>
                            <span className="text-sm text-gray-500">
                                {localSettings.inProgressItems ? 'On' : 'Off'}
                            </span>
                        </div>
                    </div>

                    {/* Completed Child Items */}
                    <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-900 mb-0.5">
                            Completed Child Items
                        </div>
                                                <div className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer transition-colors py-2">

                            <Switch
                                checked={localSettings.completedChildItems}
                                onChange={handleToggleChange('completedChildItems')}
                                size="small"
                            />
                            <span className="text-sm text-gray-500">
                                {localSettings.completedChildItems ? 'On' : 'Off'}
                            </span>
                        </div>
                    </div>

                    {/* Keep hierarchy with filters */}
                    <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-900 mb-0.5">
                            Keep hierarchy with filters
                        </div>
                        <div className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer transition-colors py-2">
                            <Tooltip title="Maintain the work item hierarchy when applying filters">
                            <Switch
                                checked={localSettings.keepHierarchyWithFilters}
                                onChange={handleToggleChange('keepHierarchyWithFilters')}
                                size="small"
                            />
                            </Tooltip>
                            <span className="text-sm text-gray-500">
                                {localSettings.keepHierarchyWithFilters ? 'On' : 'Off'}
                            </span>
                        </div>
                    </div>

                    {/* Side Pane */}
                    {/* <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                            Side Pane
                        </div>
                        <RadioGroup
                            value={localSettings.sidePane}
                            onChange={handleSidePaneChange}
                        >
                            <FormControlLabel
                                value="planning"
                                control={<Radio size="small" />}
                                label="Planning"
                            />
                            <FormControlLabel
                                value="off"
                                control={<Radio size="small" />}
                                label="Off"
                            />
                        </RadioGroup>
                    </div> */}
                </div>
            </Popover>
        </ThemeProvider>
    );
};

export default BacklogSettingsPopover;
