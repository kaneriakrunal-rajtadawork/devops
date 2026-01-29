'use client';

import React from 'react';
import Dropdown from '@/utils/Dropdown';
import FormField from '@/components/reusables/FormField';
import StyledDateTimePicker from '@/components/reusables/StyledDateTimePicker';

/**
 * PlanningSection - Container for planning fields
 */
const PlanningSection = ({ title, children }) => {
    return (
        <div className="rounded-md shadow-sm bg-white px-4 py-3">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

/**
 * FieldLabel - Common label style for form fields
 */
const FieldLabel = ({ children }) => (
    <div className="text-[rgba(0,0,0,0.55)] text-xs font-normal mb-1">
        {children}
    </div>
);

// Dropdown options
const PRIORITY_OPTIONS = [1, 2, 3, 4].map(n => ({ label: n, value:n }));
const ACTIVITY_OPTIONS = [
    { label: 'Deployment', value: 'deployment' },
    { label: 'Design', value: 'design' },
    { label: 'Development', value: 'development' },
    { label: 'Documentation', value: 'documentation' },
    { label: 'Testing', value: 'testing' },
    { label: 'Requirements', value: 'requirements' },
];

/**
 * TaskPlanningPanel - Planning fields for Task work item type
 */
export const TaskPlanningPanel = ({
    priority,
    onPriorityChange,
    activity,
    onActivityChange,
    remaining,
    onRemainingChange,
}) => {
    return (
        <PlanningSection title="Planning">
            <div className="mb-4">
                <FieldLabel>Priority</FieldLabel>
                <Dropdown
                    options={PRIORITY_OPTIONS}
                    initialValue={priority}
                    onSelect={onPriorityChange}
                    className="w-full"
                />
            </div>
            <div className="mb-4">
                <FieldLabel>Activity</FieldLabel>
                <Dropdown
                    options={ACTIVITY_OPTIONS}
                    initialValue={typeof activity === 'object' ? activity?.label : activity}
                    onSelect={onActivityChange}
                    className="w-full"
                />
            </div>
            <div className="mb-4">
                <FieldLabel>Remaining Work</FieldLabel>
                <input
                    type="number"
                    value={remaining}
                    onChange={e => onRemainingChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
            </div>
        </PlanningSection>
    );
};

/**
 * EpicPlanningPanel - Planning fields for Epic work item type
 */
export const EpicPlanningPanel = ({
    priority,
    onPriorityChange,
    startDate,
    onStartDateChange,
    targetDate,
    onTargetDateChange,
}) => {
    return (
        <PlanningSection title="Planning">
            <div className="mb-4">
                <FieldLabel>Priority</FieldLabel>
                <Dropdown
                    options={PRIORITY_OPTIONS}
                    initialValue={priority}
                    onSelect={onPriorityChange}
                    className="w-full"
                />
            </div>
            <div className="mb-4 space-y-4">
                <StyledDateTimePicker
                    label="Start Date"
                    value={startDate}
                    onChange={onStartDateChange}
                />
                <StyledDateTimePicker
                    label="Target Date"
                    value={targetDate}
                    onChange={onTargetDateChange}
                    sx={{ mt: 2 }}
                />
            </div>
        </PlanningSection>
    );
};

/**
 * IssuePlanningPanel - Planning fields for Issue work item type
 */
export const IssuePlanningPanel = ({
    effort,
    onEffortChange,
    effortError,
    priority,
    onPriorityChange,
}) => {
    return (
        <PlanningSection title="Planning">
            <div className="mb-4">
                <FieldLabel>Effort</FieldLabel>
                <input
                    type="number"
                    value={effort}
                    onChange={e => onEffortChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded text-sm text-gray-500 ${effortError ? 'border-red-500' : 'border-gray-200'
                        }`}
                />
                {effortError && (
                    <p className="mt-1 text-xs text-red-500">{effortError}</p>
                )}
            </div>
            <div className="mb-4">
                <FieldLabel>Priority</FieldLabel>
                <Dropdown
                    options={PRIORITY_OPTIONS}
                    initialValue={priority}
                    onSelect={onPriorityChange}
                    className="w-full"
                />
            </div>
        </PlanningSection>
    );
};

/**
 * PlanningPanel - Main component that renders the correct panel based on work item type
 */
const PlanningPanel = ({ workItemType, ...props }) => {
    const type = workItemType?.toLowerCase();

    switch (type) {
        case 'task':
            return <TaskPlanningPanel {...props} />;
        case 'epic':
            return <EpicPlanningPanel {...props} />;
        case 'issue':
            return <IssuePlanningPanel {...props} />;
        default:
            return null;
    }
};

export default PlanningPanel;
