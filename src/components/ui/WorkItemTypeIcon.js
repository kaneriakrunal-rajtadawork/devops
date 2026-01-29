import React from 'react';
import {
    CheckBox as TaskIcon,
    BugReport as BugIcon,
    Stars as FeatureIcon,
    AutoStories as EpicIcon,
    ReportProblem as IssueIcon,
    Description as DefaultIcon,
    Science as TestCaseIcon,
    AutoAwesome as EnhancementIcon,
    MenuBook as DocsIcon,
    Person as UserStoryIcon
} from '@mui/icons-material';

// Work item type configurations
export const WORK_ITEM_TYPE_CONFIG = {
    Task: {
        icon: TaskIcon,
        color: '#a4880a',
        bgColor: '#E6F2FF'
    },
    Bug: {
        icon: BugIcon,
        color: '#CC293D', // Red
        bgColor: '#FFEBEE'
    },
    Feature: {
        icon: FeatureIcon,
        color: '#773B93', // Purple
        bgColor: '#F3E5F5'
    },
    Epic: {
        icon: EpicIcon,
        color: '#e06c00',
        bgColor: '#FFF3E0'
    },
    Issue: {
        icon: IssueIcon,
        color: '#339947',
        bgColor: '#FCE4EC'
    },
    'Test Case': {
        icon: TestCaseIcon,
        color: '#107C10',
        bgColor: '#E8F5E9'
    },
    Enhancement: {
        icon: EnhancementIcon,
        color: '#00B7C3', // Teal
        bgColor: '#E0F7FA'
    },
    Documentation: {
        icon: DocsIcon,
        color: '#5C2D91', // Deep purple
        bgColor: '#EDE7F6'
    },
    'User Story': {
        icon: UserStoryIcon,
        color: '#0078D4', // Azure blue
        bgColor: '#E6F2FF'
    }
};

/**
 * WorkItemTypeIcon - Displays an icon representing the work item type
 * @param {string} type - The work item type (Task, Bug, Epic, Issue, etc.)
 * @param {number} size - Icon size in pixels (default: 16)
 * @param {boolean} showBackground - Whether to show background circle (default: false)
 */
export default function WorkItemTypeIcon({
    type,
    size = 16,
    showBackground = false
}) {
    const config = WORK_ITEM_TYPE_CONFIG[type] || {
        icon: DefaultIcon,
        color: '#666666',
        bgColor: '#F5F5F5'
    };

    const IconComponent = config.icon;

    if (showBackground) {
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size + 8,
                    height: size + 8,
                    borderRadius: 4,
                    backgroundColor: config.bgColor,
                }}
            >
                <IconComponent
                    style={{
                        fontSize: size,
                        color: config.color
                    }}
                />
            </span>
        );
    }

    return (
        <IconComponent
            style={{
                fontSize: size,
                color: config.color,
                verticalAlign: 'middle'
            }}
        />
    );
}
