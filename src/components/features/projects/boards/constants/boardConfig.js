/**
 * Board configuration constants
 */

import { WORKITEMTYPE_COLORS } from '@/constants/common.constants';;

// Board column configuration
export const BOARD_COLUMNS = [
    { id: 'to do', title: 'To Do' },
    { id: 'doing', title: 'Doing' },
    { id: 'done', title: 'Done' }
];

// Work item type visual configuration
export const WORK_ITEM_ICONS = {
    epic: {
        icon: '👑',
        color: WORKITEMTYPE_COLORS.epic, // rgb(224,108,0)
        bg: 'bg-purple-50',
        iconComponent: null // Can be replaced with Lucide icon
    },
    task: {
        icon: '📋',
        color: WORKITEMTYPE_COLORS.task, // rgb(164,136,10)
        bg: 'bg-blue-50',
        iconComponent: null
    },
    issue: {
        icon: '🐛',
        color: WORKITEMTYPE_COLORS.issue, // rgb(51,153,71)
        bg: 'bg-red-50',
        iconComponent: null
    },
    default: {
        icon: '📌',
        color: 'rgb(156,163,175)', // gray-400 equivalent
        bg: 'bg-gray-50',
        iconComponent: null
    }
};

// State colors for dropdowns and badges
export const STATE_COLORS = {
    'to do': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
    'doing': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    'done': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    'default': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' }
};
